import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { WorkflowTemplateBase, WorkflowTemplateDetail } from '../workflow-template/workflow-template.service';
import { NodeInfo, NodeStatus } from '../node/node.service';

export interface Workflow {
  uid: string;
  createdAt: string;
  name: string;
  status?: string;
}

export interface WorkflowStatus {
  phase: string;
  startedAt: string;
  finishedAt: string;
  nodes: {string: NodeStatus};
}

export interface WorkflowDetail extends Workflow {
  workflowTemplate: WorkflowTemplateDetail;
}

export interface WorkflowResponse {
  count: number;
  workflows: Workflow[];
}

export interface CreateWorkflow {
  namespace: string;
  workflowTemplate: WorkflowTemplateDetail;
}

@Injectable()
export class WorkflowService {

  private baseUrl = 'http://localhost:8888';
  private baseRPCUrl = 'localhost:8888';

  constructor(private client: HttpClient) {
  }

  watchWorkflow(namespace: string, name: string) {
    return new WebSocket(`ws://${this.baseRPCUrl}/apis/v1beta1/${namespace}/workflows/${name}/watch`);
  }

  getWorkflow(namespace: string, uid: string) {
    return this.client.get<WorkflowDetail>(`${this.baseUrl}/apis/v1beta1/${namespace}/workflows/${uid}`);
  }

  listWorkflows(namespace: string, workflowTemplateUid?: string, version?: number): Observable<WorkflowResponse> {
    let url = `${this.baseUrl}/apis/v1beta1/${namespace}/workflows`;
    if (workflowTemplateUid) {
      url += `?workflowTemplateUid=${workflowTemplateUid}`;

      if (version) {
        url += `&workflowTemplateVersion=${version}`;
      }
    }

    return this.client.get<WorkflowResponse>(url);
  }

  executeWorkflow(namespace: string, request: CreateWorkflow) {
    const url = `${this.baseUrl}/apis/v1beta1/${namespace}/workflows`;
    return this.client.post<any>(url, request);
  }
}
