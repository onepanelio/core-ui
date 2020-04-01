import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { FormComponent } from "../../fields/form/form.component";
import { CronWorkflow, KeyValue } from "../../../api";
import { NamespaceTracker } from "../../namespace/namespace-tracker.service";
import { Router } from "@angular/router";
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";
import {
  WorkflowExecuteDialogComponent,
} from "../../workflow/workflow-execute-dialog/workflow-execute-dialog.component";
import { CronWorkflowFormatter } from "../models";

export interface CronWorkflowEditData {
  cronWorkflow: CronWorkflow,
  manifest: string,
}

@Component({
  selector: 'app-cron-workflow-edit-dialog',
  templateUrl: './cron-workflow-edit-dialog.component.html',
  styleUrls: ['./cron-workflow-edit-dialog.component.scss']
})
export class CronWorkflowEditDialogComponent implements OnInit {
  @ViewChild(FormComponent, {static: false}) form: FormComponent;

  parameters: Array<FieldData> = [];
  labels = new Array<KeyValue>();
  schedulingText = '';

  constructor(
      private namespaceTracker: NamespaceTracker,
      private router: Router,
      public dialogRef: MatDialogRef<CronWorkflowEditDialogComponent>,
      @Inject(MAT_DIALOG_DATA) public data: CronWorkflowEditData) {
    this.setManifest(data);
    this.schedulingText = CronWorkflowFormatter.toYamlString(data.cronWorkflow, true);
  }

  ngOnInit() {
  }

  private setManifest(data: CronWorkflowEditData) {
    let parameters = WorkflowExecuteDialogComponent.pluckParameters(data.manifest);

    if(data.cronWorkflow.workflowExecution) {
      for (let dataParam of data.cronWorkflow.workflowExecution.parameters) {
        for(let param of parameters) {
          if(param.name === dataParam.name) {
            param.value = dataParam.value;
            break;
          }
        }
      }
    }

    this.parameters = parameters;
  }

  getData() {
    let data = {
      labels: this.labels,
      workflowExecution: {
        parameters: this.parameters
      },
      cron: CronWorkflowFormatter.fromYaml(this.schedulingText)
    };

    return data;
  }

  cancel() {
    this.dialogRef.close();
  }

  save() {
    if(!this.form.form.valid) {
      this.form.form.markAllAsTouched();
      return;
    }

    const data = this.getData();

    if(!data) {
      return;
    }

    this.dialogRef.close(data);
  }

  goToEnvironmentVariables() {
    this.dialogRef.afterClosed().subscribe(res => {
      this.router.navigate(['/', this.namespaceTracker.activeNamespace, 'secrets']);
    });

    this.dialogRef.close();
  }

  ngOnDestroy(): void {
  }
}
