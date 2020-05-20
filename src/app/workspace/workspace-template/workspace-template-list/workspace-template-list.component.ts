import { Component, OnInit, ViewChild } from '@angular/core';
import {
  CreateWorkspaceBody,
  ListWorkspaceTemplatesResponse,
  WorkspaceServiceService,
  WorkspaceTemplate,
  WorkspaceTemplateServiceService
} from "../../../../api";
import { ActivatedRoute } from "@angular/router";
import { Pagination } from "../../../workflow-template/workflow-template-view/workflow-template-view.component";
import { WorkspaceTemplateEditComponent } from "../workspace-template-edit/workspace-template-edit.component";
import { Alert } from "../../../alert/alert";
import { MatDialog } from "@angular/material/dialog";
import { WorkspaceExecuteDialogComponent } from "../../workspace-execute-dialog/workspace-execute-dialog.component";
import { PageEvent } from "@angular/material/paginator";
import { AppRouter } from "../../../router/app-router.service";
import { AlertService } from "../../../alert/alert.service";
import { HttpErrorResponse } from "@angular/common/http";
import { WorkspaceTemplateCreateComponent } from "../workspace-template-create/workspace-template-create.component";

@Component({
  selector: 'app-workspace-template-list',
  templateUrl: './workspace-template-list.component.html',
  styleUrls: ['./workspace-template-list.component.scss']
})
export class WorkspaceTemplateListComponent implements OnInit {
  @ViewChild(WorkspaceTemplateCreateComponent, {static: false}) workspaceTemplateCreateEditor: WorkspaceTemplateCreateComponent;
  @ViewChild(WorkspaceTemplateEditComponent, {static: false}) workspaceTemplateEditor: WorkspaceTemplateEditComponent;

  blankTemplate: WorkspaceTemplate = {
    name: 'Blank template'
  }

  showWorkspaceTemplateEditor = true;

  namespace: string;
  pagination = new Pagination();
  workspaceTemplatesResponse: ListWorkspaceTemplatesResponse;
  workspaceTemplates: WorkspaceTemplate[] = [];

  /**
   * null means the selected template is the blank template.
   * undefined means no template is selected.
   * otherwise we do have a specific template selected.
   */
  selectedTemplate: WorkspaceTemplate|null|undefined = null;

  workspaceTemplateEditLoading = false;

  constructor(
      private appRouter: AppRouter,
      private workspaceTemplateService: WorkspaceTemplateServiceService,
      private workspaceService: WorkspaceServiceService,
      private activatedRoute: ActivatedRoute,
      private dialog: MatDialog,
      private alertService: AlertService,
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
        }, (err: HttpErrorResponse) => {
          if(err.status === 409) {
            this.workspaceTemplateCreateEditor.setAlert(new Alert({
              message: err.error.message,
              type: 'danger',
            }));
          }
        })
  }

  onEditUpdate(template: WorkspaceTemplate) {
    this.workspaceTemplateEditLoading = true;
    this.workspaceTemplateService.updateWorkspaceTemplate(this.namespace, template.uid, template)
        .subscribe(res => {
          this.workspaceTemplateEditor.getWorkspaceTemplateVersions();
          this.workspaceTemplateEditor.setAlert(new Alert({
            type: 'success',
            message: 'Template has been updated'
          }))
          this.workspaceTemplateEditLoading = false;
        }, err => {
          this.workspaceTemplateEditLoading = false;
        })
  }

  createWorkspace(template: WorkspaceTemplate) {
    const dialogRef = this.dialog.open(WorkspaceExecuteDialogComponent, {
      width: '60vw',
      maxHeight: '100vh',
      data: {
        namespace: this.namespace,
        template: template,
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (!result) {
        return;
      }

      const workspace: CreateWorkspaceBody = {
        workspaceTemplateUid: result.template.uid,
        parameters: result.parameters,
        labels: result.labels
      };

      this.workspaceService.createWorkspace(this.namespace, workspace)
          .subscribe(res => {
            this.appRouter.navigateToWorkspaces(this.namespace);
          })
    });
  }

  deleteWorkspaceTemplate(template: WorkspaceTemplate) {
    this.workspaceTemplateService.archiveWorkspaceTemplate(this.namespace, template.uid)
        .subscribe(res => {
          const templateIndex = this.workspaceTemplates.indexOf(template);
          if(templateIndex > -1) {
            this.workspaceTemplates.splice(templateIndex, 1);
          }

          this.getWorkspaceTemplates();
        }, (err: HttpErrorResponse) => {
          if(err.status === 400 && err.error.code  === 9) {
            this.alertService.storeAlert(new Alert({
              message: 'Error deleting template ' + template.uid + ', it has running workspaces',
              type: 'danger',
            }));
            return;
          }

          this.alertService.storeAlert(new Alert({
            message: 'Error deleting template ' + template.uid,
            type: 'danger',
          }));

        })
  }

  onPageChange(event: PageEvent) {
    this.pagination.page = event.pageIndex;
    this.pagination.pageSize = event.pageSize;

    this.showWorkspaceTemplateEditor = false;
    this.selectedTemplate = undefined;

    this.getWorkspaceTemplates();
  }
}
