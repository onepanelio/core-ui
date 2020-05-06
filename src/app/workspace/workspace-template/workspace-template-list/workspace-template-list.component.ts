import { Component, OnInit, ViewChild } from '@angular/core';
import {
  ListWorkspaceTemplatesResponse, Workspace,
  WorkspaceServiceService,
  WorkspaceTemplate,
  WorkspaceTemplateServiceService
} from "../../../../api";
import { ActivatedRoute } from "@angular/router";
import { Pagination } from "../../../workflow-template/workflow-template-view/workflow-template-view.component";
import { WorkspaceTemplateEditComponent } from "../workspace-template-edit/workspace-template-edit.component";
import { Alert } from "../../../alert/alert";

@Component({
  selector: 'app-workspace-template-list',
  templateUrl: './workspace-template-list.component.html',
  styleUrls: ['./workspace-template-list.component.scss']
})
export class WorkspaceTemplateListComponent implements OnInit {
  @ViewChild(WorkspaceTemplateEditComponent, {static: false}) workspaceTemplateEditor: WorkspaceTemplateEditComponent;

  blankTemplate: WorkspaceTemplate = {
    name: 'Blank template'
  }

  showWorkspaceTemplateEditor = false;

  namespace: string;
  pagination = new Pagination();
  workspaceTemplatesResponse: ListWorkspaceTemplatesResponse;
  workspaceTemplates: WorkspaceTemplate[] = [];

  selectedTemplate: WorkspaceTemplate = null;

  constructor(
      private workspaceTemplateService: WorkspaceTemplateServiceService,
      private workspaceService: WorkspaceServiceService,
      private activatedRoute: ActivatedRoute
  ) { }

  ngOnInit() {
    this.activatedRoute.paramMap.subscribe(next => {
      this.namespace = next.get('namespace');

      this.getWorkspaceTemplates();
    });
  }

  getWorkspaceTemplates() {
    this.workspaceTemplateService.listWorkspaceTemplates(this.namespace, this.pagination.pageSize, this.pagination.page + 1)
        .subscribe(res => {
          this.workspaceTemplatesResponse = res;
          this.workspaceTemplates = res.workspaceTemplates;
        })
  }

  newWorkspaceTemplate() {
    this.showWorkspaceTemplateEditor = true;
    this.selectedTemplate = null;
  }

  selectTemplate(template: WorkspaceTemplate) {
    this.showWorkspaceTemplateEditor = true;
    this.selectedTemplate = template;
  }

  cancelWorkspaceTemplate() {
    this.showWorkspaceTemplateEditor = false;
    this.selectedTemplate = null;
  }

  onCreate(template: WorkspaceTemplate) {
    this.workspaceTemplateService.createWorkspaceTemplate(this.namespace, template)
        .subscribe(res => {
          this.getWorkspaceTemplates();
          this.cancelWorkspaceTemplate();
        }, err => {
          console.log(err);
        })
  }

  onEditUpdate(template: WorkspaceTemplate) {
    this.workspaceTemplateService.updateWorkspaceTemplate(this.namespace, template.name, template)
        .subscribe(res => {
          this.workspaceTemplateEditor.getWorkspaceTemplateVersions();
          this.workspaceTemplateEditor.setAlert(new Alert({
            type: 'success',
            message: 'Template has been updated'
          }))
        })
  }

  createWorkspace(template: WorkspaceTemplate) {
    const workspace: Workspace = {
      name: "name",
      workspaceTemplate: template,
    }

    this.workspaceService.createWorkspace(this.namespace, workspace)
        .subscribe(res => {
          console.log(res);
        })
  }
}
