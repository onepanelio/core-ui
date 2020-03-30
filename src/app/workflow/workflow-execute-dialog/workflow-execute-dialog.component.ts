import { Component, Inject, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";
import * as yaml from 'js-yaml';
import { NamespaceTracker } from "../../namespace/namespace-tracker.service";
import { Router } from "@angular/router";
import { FormComponent } from "../../fields/form/form.component";
import { KeyValue } from "../../../api";
import { MatCheckboxChange } from "@angular/material/checkbox";

export interface WorkflowExecuteDialogData {
  manifest: string;
}

@Component({
  selector: 'app-workflow-execute-dialog',
  templateUrl: './workflow-execute-dialog.component.html',
  styleUrls: ['./workflow-execute-dialog.component.scss']
})
export class WorkflowExecuteDialogComponent implements OnInit, OnDestroy {
  public static pluckParameters(manifest) {
    const res = yaml.safeLoad(manifest);
    const parameters = [];

    if(res && res.spec && res.spec.arguments && res.spec.arguments.parameters) {
      for(const param of res.spec.arguments.parameters) {
        parameters.push(param);
      }
    }

    return parameters;
  }

  @ViewChild(FormComponent, {static: false}) form: FormComponent;

  showCron = false;
  parameters: Array<FieldData> = [];
  labels = new Array<KeyValue>();
  schedulingText: string = `# Schedule at which the Workflowwill be run. E.g.5 4 * * *
schedule: "* * * * *"
# Timezone during which the Workflow will be run. E.g. America/Los_Angeles
timezone: 'America/Los_Angeles'
# If true Workflow scheduling will not occur.
suspend: false
# Policy that determines what to do if multiple Workflows are scheduled at the same time. Available      options: Allow: allow all, Replace: remove all old before scheduling a new, Forbid: do not allow any new while there are old 
concurrencyPolicy: Allow
# Number of seconds after the last successful run during which a missed Workflow will be run
startingDeadlineSeconds: 0
# Number of successful Workflows that will be persisted at a time
successfulJobsHistoryLimit:\t3
# Number of failed Workflows that will be persisted at a time
failedJobsHistoryLimit: 1`;

  constructor(
      private namespaceTracker: NamespaceTracker,
      private router: Router,
      public dialogRef: MatDialogRef<WorkflowExecuteDialogComponent>,
      @Inject(MAT_DIALOG_DATA) public data: WorkflowExecuteDialogData) {
    this.setManifest(data.manifest);
  }

  ngOnInit() {
  }

  private setManifest(value: string) {
    this.parameters = WorkflowExecuteDialogComponent.pluckParameters(value);
  }

  getData() {
    let data = {
      workflowExecution: {
        parameters: this.parameters,
        labels: this.labels,
      }
    };

    if(this.showCron) {
      data['cron'] = yaml.safeLoad(this.schedulingText);
    }

    return data;
  }

  cancel() {
    this.dialogRef.close();
  }

  execute() {
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

  onCronCheck(value: MatCheckboxChange) {
    this.showCron = value.checked;
  }
}
