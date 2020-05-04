import { Component, OnInit } from '@angular/core';
import { ListWorkspaceTemplatesResponse, WorkspaceTemplate, WorkspaceTemplateServiceService } from "../../../../api";
import { ActivatedRoute } from "@angular/router";
import { Pagination } from "../../../workflow-template/workflow-template-view/workflow-template-view.component";

@Component({
  selector: 'app-workspace-template-list',
  templateUrl: './workspace-template-list.component.html',
  styleUrls: ['./workspace-template-list.component.scss']
})
export class WorkspaceTemplateListComponent implements OnInit {
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
    this.selectedTemplate = {
      name: 'new'
    }
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
    console.log(template);
  }
}
