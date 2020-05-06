import { Component, Inject, OnInit } from '@angular/core';
import { KeyValue, WorkspaceTemplate, WorkspaceTemplateServiceService } from "../../../api";
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";
import {
  WorkflowExecuteDialogComponent,
} from "../../workflow/workflow-execute-dialog/workflow-execute-dialog.component";
import { AbstractControl, FormBuilder, FormGroup, Validators } from "@angular/forms";

export interface WorkspaceExecuteDialogData {
  namespace: string;
  template: WorkspaceTemplate;
}

@Component({
  selector: 'app-workspace-execute-dialog',
  templateUrl: './workspace-execute-dialog.component.html',
  styleUrls: ['./workspace-execute-dialog.component.scss']
})
export class WorkspaceExecuteDialogComponent implements OnInit {
  workspaceTemplate: WorkspaceTemplate;
  labels = new Array<KeyValue>();
  parameters: Array<FieldData>;

  workspaceNameInput: AbstractControl;
  form: FormGroup;

  constructor(
      public dialogRef: MatDialogRef<WorkspaceExecuteDialogComponent>,
      private formBuilder: FormBuilder,
      private workspaceTemplateService: WorkspaceTemplateServiceService,
      @Inject(MAT_DIALOG_DATA) public data: WorkspaceExecuteDialogData
  ) {
    this.form = this.formBuilder.group({
      workspaceNameInput: [
        '',
        Validators.compose([
          Validators.required,
        ]),
      ]});

    this.workspaceNameInput = this.form.get('workspaceNameInput');
    this.workspaceTemplate = data.template;

    this.workspaceTemplateService.getWorkspaceTemplate(data.namespace, data.template.uid)
        .subscribe(res => {
          this.workspaceTemplate = res;

          this.workspaceTemplateService.generateWorkspaceTemplateWorkflowTemplate(data.namespace, 'generated', res)
              .subscribe(generatedRes => {
                this.parameters = WorkflowExecuteDialogComponent.pluckParameters(generatedRes.manifest);
              })
        });

  }

  ngOnInit() {
  }

  cancel() {
    this.dialogRef.close();
  }

  createAndRun() {
    this.dialogRef.close({
      name: this.workspaceNameInput.value,
      template: this.workspaceTemplate,
      parameters: this.parameters,
      labels: this.labels,
    });
  }
}
