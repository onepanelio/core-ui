import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { FormComponent } from "../../fields/form/form.component";
import { CronWorkflow, KeyValue, Parameter } from "../../../api";
import { NamespaceTracker } from "../../namespace/namespace-tracker.service";
import { Router } from "@angular/router";
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";
import { CronWorkflowFormatter } from "../models";
import * as yaml from 'js-yaml';

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

  parameters: Array<Parameter> = [];
  labels = new Array<KeyValue>();
  schedulingText = '';

  constructor(
      private namespaceTracker: NamespaceTracker,
      private router: Router,
      public dialogRef: MatDialogRef<CronWorkflowEditDialogComponent>,
      @Inject(MAT_DIALOG_DATA) public data: CronWorkflowEditData) {
    this.setManifest(data.cronWorkflow.manifest);
    this.schedulingText = CronWorkflowFormatter.toYamlString(data.cronWorkflow, true);
    if(data.cronWorkflow.labels) {
      this.labels = data.cronWorkflow.labels;
    }
  }

  ngOnInit() {
  }

  private setManifest(manifest: string) {
    let parsedManifest = yaml.safeLoad(manifest);
    let parameters = [];

    if(parsedManifest.workflowSpec && parsedManifest.workflowSpec.arguments) {
      if(!parsedManifest.workflowSpec.arguments.parameters) {
        return [];
      }

      for (let dataParam of parsedManifest.workflowSpec.arguments.parameters) {
        parameters.push(dataParam);
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
