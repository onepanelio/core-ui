import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from "../../environments/environment";

export interface ContainerDefinition {
  image: string;
  command: Array<string>;
  args: Array<string>;
}

export interface TemplateDefinition {
  name: string;
  container?: ContainerDefinition;
}

export interface WorkflowTemplateBase {
  uid: string;
  createdAt: string;
  name: string;
  version: number;
  isLatest?: boolean;
}

export interface WorkflowTemplateDetail extends WorkflowTemplateBase {
  manifest: string;
}

export interface CreateWorkflowTemplate {
  name: string;
  manifest: string;
}

export interface UpdateWorkflowTemplate {
  manifest: string;
}

export interface WorkflowTemplatesResponse {
  count: number;
  workflowTemplates: WorkflowTemplateBase[];
}

export interface ArchiveWorkflowTemplateResponse {
  workflowTemplate: {
    isArchived: boolean;
  }
}

@Injectable()
export class WorkflowTemplateService {
  constructor(private client: HttpClient) {
  }

  listWorkflowTemplates(namespace: string): Observable<WorkflowTemplatesResponse> {
    return this.client.get<WorkflowTemplatesResponse>(`${environment.baseUrl}/apis/v1beta1/${namespace}/workflow_templates`);
  }

  getWorkflowTemplate(namespace: string, uid: string): Observable<WorkflowTemplateDetail> {
    return this.client.get<WorkflowTemplateDetail>(`${environment.baseUrl}/apis/v1beta1/${namespace}/workflow_templates/${uid}`);
  }

  create(namespace: string, template: CreateWorkflowTemplate) {
    return this.client.post<WorkflowTemplateDetail>(`${environment.baseUrl}/apis/v1beta1/${namespace}/workflow_templates`, template);
  }

  createWorkflowTemplateVersion(namespace: string, uid: string, template: CreateWorkflowTemplate) {
    const url = `${environment.baseUrl}/apis/v1beta1/${namespace}/workflow_templates/${uid}/versions`;
    return this.client.post<WorkflowTemplateDetail>(url, template);
  }

  listWorkflowTemplateVersions(namespace: string, uid: string) {
    return this.client.get<WorkflowTemplatesResponse>(`${environment.baseUrl}/apis/v1beta1/${namespace}/workflow_templates/${uid}/versions`);
  }

  getWorkflowTemplateForVersion(namespace: string, uid: string, version: number) {
    const url = `${environment.baseUrl}/apis/v1beta1/${namespace}/workflow_templates/${uid}/versions/${version}`;
    return this.client.get<WorkflowTemplateDetail>(url);
  }

  updateWorkflowTemplateForVersion(namespace: string, uid: string, version: number, update: UpdateWorkflowTemplate) {
    const url = `${environment.baseUrl}/apis/v1beta1/${namespace}/workflow_templates/${uid}/versions/${version}`;
    return this.client.put<WorkflowTemplateDetail>(url, update);
  }

  archiveWorkflowTemplate(namespace: string, uid: string) {
    const url = `${environment.baseUrl}/apis/v1beta1/${namespace}/workflow_templates/${uid}/archive`;

    return this.client.put<ArchiveWorkflowTemplateResponse>(url, {});
  }
}
