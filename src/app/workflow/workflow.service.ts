import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import * as yaml from 'js-yaml';
import { WorkflowTemplateDetail } from '../workflow-template/workflow-template.service';
import { NodeStatus } from '../node/node.service';
import { map } from "rxjs/operators";
import { environment } from "../../environments/environment";
import { AuthService } from "../auth/auth.service";

export interface Workflow {
  uid: string;
  createdAt: string;
  finishedAt?: string;
  name: string;
  manifest?: string;
  phase?: string;
}

// https://github.com/argoproj/argo/issues/1849#issuecomment-565640866
export type WorkflowPhase = 'Pending' | 'Running' | 'Succeeded' | 'Skipped' | 'Failed' | 'Error';

export interface WorkflowStatus {
  phase: WorkflowPhase;
  startedAt: string;
  finishedAt: string;
  nodes: {string: NodeStatus};
}

export interface WorkflowManifest {
  spec: any;
  status: WorkflowStatus;
}

export interface WorkflowDetail extends Workflow {
  workflowTemplate: WorkflowTemplateDetail;
}

export interface WorkflowResponse {
  count: number;
  workflowExecutions: Workflow[];
  page: number;
  pages: number;
  totalCount: number;
}

export interface CreateWorkflow {
  namespace: string;
  workflowTemplate: WorkflowTemplateDetail;
  parameters: Array<{name:string, value: string}>;
}

export class SimpleWorkflowDetail implements WorkflowDetail{
  static activePhases = {
    'Pending': true,
    'Running': true
  };

  private jsonManifest: WorkflowManifest|null = null;

  uid: string;
  createdAt: string;
  name: string;
  manifest?: string;
  yamlManifest?: string;
  workflowTemplate: WorkflowTemplateDetail;

  constructor(workflowDetail: WorkflowDetail) {
    this.uid = workflowDetail.uid;
    this.createdAt = workflowDetail.createdAt;
    this.name = workflowDetail.name;
    this.manifest = workflowDetail.manifest;
    this.workflowTemplate = workflowDetail.workflowTemplate;

    if(this.manifest) {
      this.updateWorkflowManifest(this.manifest);
    }
  }

  get workflowStatus(): WorkflowStatus|null {
    if(!this.jsonManifest) {
      return null;
    }
    
    return this.jsonManifest.status;
  }

  get phase(): WorkflowPhase|null {
    if(!this.jsonManifest) {
      return null;
    }

    return this.jsonManifest.status.phase;
  }

  get active(): boolean {
    const phase = this.phase;
    if(!phase) {
      return false;
    }

    return SimpleWorkflowDetail.activePhases[phase];
  }

  get succeeded(): boolean {
    const phase = this.phase;
    if(!phase) {
      return false;
    }

    return this.phase === 'Succeeded';
  }

  updateWorkflowManifest(manifest: string) {
    this.jsonManifest = JSON.parse(manifest);
    
    let jsonTemplateManifest = yaml.safeLoad(this.workflowTemplate.manifest);
    if (this.jsonManifest.spec.arguments && this.jsonManifest.spec.arguments.parameters) {
      jsonTemplateManifest.arguments.parameters = this.jsonManifest.spec.arguments.parameters;
    }
    this.yamlManifest = yaml.safeDump(jsonTemplateManifest);
  }

  getNodeStatus(nodeId: string): NodeStatus|null {
    const status = this.workflowStatus;
    if(!status) {
      return null;
    }

    return status.nodes[nodeId];
  }
}

export class WorkflowExecution {
  uid: string;
  createdAt: string;

  startedAt: string;
  finishedAt: string;

  name: string;
  phase?: string;

  private jsonManifest: WorkflowManifest|null = null;

  constructor(workflow: Workflow) {
    this.uid = workflow.uid;
    this.createdAt = workflow.createdAt;
    this.startedAt = workflow.createdAt;
    this.finishedAt = workflow.finishedAt;
    this.name = workflow.name;
    this.phase = workflow.phase;
  }

  get active(): boolean {
    const phase = this.phase;
    if(!phase) {
      return false;
    }

    return SimpleWorkflowDetail.activePhases[phase];
  }

  get succeeded(): boolean {
    const phase = this.phase;
    if(!phase) {
      return false;
    }

    return this.phase === 'Succeeded';
  }

  updateWorkflowManifest(manifest: string) {
    this.jsonManifest = JSON.parse(manifest);
    const status = this.jsonManifest.status;

    this.startedAt = status.startedAt;
    this.finishedAt = status.finishedAt;
    this.phase = status.phase;
  }


  get workflowStatus(): WorkflowStatus|null {
    if(!this.jsonManifest) {
      return null;
    }

    return this.jsonManifest.status;
  }
}

export interface ListWorkflowRequest {
  namespace: string;
  workflowTemplateUid?: string;
  workflowTemplateVersion?: number;
  pageSize?: number;
  page?: number;
}

export class ReadableStreamWrapper {
  private decoder = new TextDecoder('utf-8');
  private line = '';
  private cancelled;
  private readableStream;

  subscriber;
  reader;

  constructor() {
  }

  getReader() {
    if(this.readableStream) {
      return this.readableStream;
    }

    const self = this;

    this.readableStream = new ReadableStream({
      start(controller) {
        return pump();
        function pump() {
          if(self.cancelled) {
            controller.close();
            return () => {};
          }

          return self.reader.read().then(({ done, value }) => {
            if(self.cancelled) {
              controller.close();
              return () => {};
            }
            try {

              // When no more data needs to be consumed, close the stream
              if (done) {
                controller.close();
                self.subscriber.complete();
                return;
              }
              // Enqueue the next data chunk into our target stream
              controller.enqueue(value);

              let res = '';
              const textValue = self.decoder.decode(value);

              for (const textItem of textValue.split('\n')) {
                if (textItem) {
                  self.line += textItem;
                  try {
                    res = JSON.parse(self.line);

                    self.subscriber.next(res);
                    self.line = '';

                  } catch (e) {
                    // Keep going, line is not ready yet.
                  }
                }
              }

            } catch (e) {
              self.subscriber.error(e);
            }
            return pump();
          });
        }
      }
    });

    return this.readableStream;
  }

  cancel(reason?: any) {
    this.cancelled = true;
    if(this.readableStream) {
      this.readableStream.cancel(reason);
    }
  }
}

@Injectable()
export class WorkflowService {
  constructor(
      private client: HttpClient,
      private authService: AuthService) {
  }

  watchWorkflow(namespace: string, name: string) {
    const url =`${environment.baseWsUrl}/apis/v1beta1/${namespace}/workflow_executions/${name}/watch`;

    return new WebSocket(url);
  }

  getWorkflow(namespace: string, uid: string) {
    return this.client.get<SimpleWorkflowDetail>(`${environment.baseUrl}/apis/v1beta1/${namespace}/workflow_executions/${uid}`)
        .pipe(
            map(res => {
              return new SimpleWorkflowDetail(res);
            })
        );
  }

  listWorkflows(request: ListWorkflowRequest): Observable<WorkflowResponse> {
    const url = `${environment.baseUrl}/apis/v1beta1/${request.namespace}/workflow_executions`;
    let query = new HttpParams();

    if (request.workflowTemplateUid) {
      query = query.append('workflowTemplateUid', request.workflowTemplateUid);
    }

    if (request.workflowTemplateVersion) {
      query = query.append('workflowTemplateVersion', request.workflowTemplateVersion.toString());
    }

    if(request.page) {
      query = query.append('page', request.page.toString());
    }

    if(request.pageSize) {
      query = query.append('pageSize', request.pageSize.toString());
    }

    return this.client.get<WorkflowResponse>(url, {
      params: query
    });
  }

  executeWorkflow(namespace: string, request: CreateWorkflow) {
    const url = `${environment.baseUrl}/apis/v1beta1/${namespace}/workflow_executions`;
    return this.client.post<any>(url, request);
  }

  terminateWorkflow(namespace: string, name: string) {
    const url = `${environment.baseUrl}/apis/v1beta1/${namespace}/workflow_executions/${name}/terminate`;

    return this.client.put(url, {});
  }

  getWorkflowMetrics(namespace: string, workflowName: string, podId: string) {
    const url = `${environment.baseUrl}/apis/v1beta1/${namespace}/workflow_executions/${workflowName}/pods/${podId}/metrics`;

    return this.client.get(url, {});
  }

  watchLogs(namespace: string, workflowName: string, podId: string, containerName = 'main') {
    const url =`${environment.baseWsUrl}/apis/v1beta1/${namespace}/workflow_executions/${workflowName}/pods/${podId}/containers/${containerName}/logs`;

    return new WebSocket(url);
  }

  getArtifact(namespace: string, workflowName: string, key: string) {
    const url = `${environment.baseUrl}/apis/v1beta1/${namespace}/workflow_executions/${workflowName}/artifacts/${encodeURIComponent(String(key))}`;

    return this.client.get(url);
  }

  listFiles(namespace: string, workflowName: string, key: string) {
    const url = `${environment.baseUrl}/apis/v1beta1/${namespace}/workflow_executions/${workflowName}/files/${encodeURIComponent(String(key))}`;

    return this.client.get(url);
  }
}

