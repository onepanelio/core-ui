import { Component, Inject, OnInit } from '@angular/core';
import {
  CreateWorkspaceBody,
  KeyValue,
  Parameter, WorkspaceServiceService,
  WorkspaceTemplate,
  WorkspaceTemplateServiceService
} from "../../../api";
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";
import {
  WorkflowExecuteDialogComponent,
} from "../../workflow/workflow-execute-dialog/workflow-execute-dialog.component";
import { FormBuilder, FormGroup } from "@angular/forms";
import { NamespaceTracker } from "../../namespace/namespace-tracker.service";
import { AppRouter } from "../../router/app-router.service";
import { HttpErrorResponse } from "@angular/common/http";
import { Alert } from "../../alert/alert";

export interface WorkspaceExecuteDialogData {
  namespace: string;
  template?: WorkspaceTemplate;
}

export type WorkspaceExecuteDialogResult = 'cancel' | 'created';

type WorkspaceExecutionState = 'loading' | 'ready' | 'creating' | 'no-templates';

@Component({
  selector: 'app-workspace-execute-dialog',
  templateUrl: './workspace-execute-dialog.component.html',
  styleUrls: ['./workspace-execute-dialog.component.scss']
})
export class WorkspaceExecuteDialogComponent implements OnInit {
  namespace: string;
  workspaceTemplates: WorkspaceTemplate[] = [];
  workspaceTemplate: WorkspaceTemplate;
  workspaceTemplateUid: string = '';
  labels = new Array<KeyValue>();
  parameters: Array<Parameter>;
  errors = {};

  state: WorkspaceExecutionState = 'loading';

  form: FormGroup;

  alert?: Alert = null;

  constructor(
      public dialogRef: MatDialogRef<WorkspaceExecuteDialogComponent>,
      public namespaceTracker: NamespaceTracker,
      private appRouter: AppRouter,
      private formBuilder: FormBuilder,
      private workspaceService: WorkspaceServiceService,
      private workspaceTemplateService: WorkspaceTemplateServiceService,
      @Inject(MAT_DIALOG_DATA) public data: WorkspaceExecuteDialogData
  ) {
    this.form = this.formBuilder.group({});

    this.namespace = data.namespace;
    
    if(data.template) {
      this.workspaceTemplates = [data.template];
      this.workspaceTemplate = data.template;
      this.workspaceTemplateUid = data.template.uid;
      this.getWorkspaceTemplate(data.namespace, data.template.uid);
    } else {
      this.workspaceTemplateService.listWorkspaceTemplates(data.namespace)
          .subscribe(res => {
            this.workspaceTemplates = res.workspaceTemplates;
            if(!res.workspaceTemplates) {
              this.state = 'no-templates';
            } else {
              this.state = 'ready';
            }
          })
    }
  }

  ngOnInit() {
  }

  cancel() {
    this.dialogRef.close('cancel');
  }

  createAndRun() {
    const createWorkspace: CreateWorkspaceBody = {
      workspaceTemplateUid: this.workspaceTemplate.uid,
      parameters: this.parameters,
      labels: this.labels
    };

    this.state = 'creating';
    this.errors = {};

    this.alert = null;

    this.workspaceService.createWorkspace(this.namespace, createWorkspace)
        .subscribe(res => {
          this.state = 'ready';
          this.dialogRef.close('created');
        }, (err: HttpErrorResponse) => {
          this.state = 'ready';
          if(err.status === 409) {
            this.errors = {
              'sys-name': 'conflict'
            };
          } else {
            this.alert = new Alert({
              message: 'Unable to create workspace',
              type: 'danger'
            });
          }
        })
  }

  private getWorkspaceTemplate(namespace: string, templateUid: string) {
    this.workspaceTemplateService.getWorkspaceTemplate(namespace, templateUid)
        .subscribe(res => {
          this.workspaceTemplate = res;

          this.workspaceTemplateService.generateWorkspaceTemplateWorkflowTemplate(namespace, 'generated', res)
              .subscribe(generatedRes => {
                this.parameters = WorkflowExecuteDialogComponent.pluckParameters(generatedRes.manifest);
              })
        });
  }

  onSelectWorkspaceTemplate(workspaceTemplateUid: string) {
    this.workspaceTemplateUid = workspaceTemplateUid;
    this.getWorkspaceTemplate(this.data.namespace, workspaceTemplateUid);
  }

  goToWorkspaceTemplates() {
    this.dialogRef.close();
    this.appRouter.navigateToWorkspaceTemplates(this.namespaceTracker.activeNamespace);
  }
}
