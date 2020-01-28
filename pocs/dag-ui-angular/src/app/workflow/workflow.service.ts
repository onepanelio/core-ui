import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { WorkflowTemplateBase, WorkflowTemplateDetail } from '../workflow-template/workflow-template.service';
import { NodeInfo, NodeStatus } from '../node/node.service';
import { map } from "rxjs/operators";

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

export class SimpleWorkflowDetail implements WorkflowDetail{
  private parsedWorkflowStatus: WorkflowStatus|null = null;

  uid: string;
  createdAt: string;
  name: string;
  status?: string;
  workflowTemplate: WorkflowTemplateDetail;

  constructor(workflowDetail: WorkflowDetail) {
    this.uid = workflowDetail.uid;
    this.createdAt = workflowDetail.createdAt;
    this.name = workflowDetail.name;
    this.status = workflowDetail.status;
    this.workflowTemplate = workflowDetail.workflowTemplate;
  }

  getWorkflowStatus(): WorkflowStatus|null {
    if(!this.status) {
      return null;
    }

    if (!this.parsedWorkflowStatus) {
      this.parsedWorkflowStatus = JSON.parse(this.status);
    }

    return this.parsedWorkflowStatus;
  }

  updateWorkflowStatus(status: string) {
    this.parsedWorkflowStatus = JSON.parse(status);
  }
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
    return this.client.get<SimpleWorkflowDetail>(`${this.baseUrl}/apis/v1beta1/${namespace}/workflows/${uid}`)
        .pipe(
            map(res => {
              return new SimpleWorkflowDetail(res);
            })
        );
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
