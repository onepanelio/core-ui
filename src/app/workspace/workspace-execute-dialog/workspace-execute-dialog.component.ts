import { Component, Inject, OnInit } from '@angular/core';
import { KeyValue, Parameter, WorkspaceTemplate, WorkspaceTemplateServiceService } from "../../../api";
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";
import {
  WorkflowExecuteDialogComponent,
} from "../../workflow/workflow-execute-dialog/workflow-execute-dialog.component";
import { FormBuilder, FormGroup } from "@angular/forms";

export interface WorkspaceExecuteDialogData {
  namespace: string;
  template?: WorkspaceTemplate;
}

@Component({
  selector: 'app-workspace-execute-dialog',
  templateUrl: './workspace-execute-dialog.component.html',
  styleUrls: ['./workspace-execute-dialog.component.scss']
})
export class WorkspaceExecuteDialogComponent implements OnInit {
  workspaceTemplates: WorkspaceTemplate[] = [];
  workspaceTemplate: WorkspaceTemplate;
  workspaceTemplateUid: string = '';
  labels = new Array<KeyValue>();
  parameters: Array<Parameter>;

  form: FormGroup;

  constructor(
      public dialogRef: MatDialogRef<WorkspaceExecuteDialogComponent>,
      private formBuilder: FormBuilder,
      private workspaceTemplateService: WorkspaceTemplateServiceService,
      @Inject(MAT_DIALOG_DATA) public data: WorkspaceExecuteDialogData
  ) {
    this.form = this.formBuilder.group({});

    if(data.template) {
      this.workspaceTemplates = [data.template];
      this.workspaceTemplate = data.template;
      this.workspaceTemplateUid = data.template.uid;
      this.getWorkspaceTemplate(data.namespace, data.template.uid);
    } else {
      this.workspaceTemplateService.listWorkspaceTemplates(data.namespace)
          .subscribe(res => {
            this.workspaceTemplates = res.workspaceTemplates;
          })
    }
  }

  ngOnInit() {
  }

  cancel() {
    this.dialogRef.close();
  }

  createAndRun() {
    this.dialogRef.close({
      template: this.workspaceTemplate,
      parameters: this.parameters,
      labels: this.labels,
    });
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
}
