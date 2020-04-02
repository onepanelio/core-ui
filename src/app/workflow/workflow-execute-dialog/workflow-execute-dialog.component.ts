import { Component, Inject, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";
import * as yaml from 'js-yaml';
import { NamespaceTracker } from "../../namespace/namespace-tracker.service";
import { Router } from "@angular/router";
import { FormComponent } from "../../fields/form/form.component";
import { KeyValue } from "../../../api";
import { MatCheckboxChange } from "@angular/material/checkbox";
import { CronWorkflowFormatter } from "../../cron-workflow/models";

export interface WorkflowExecuteDialogData {
  manifest: string;
  cron: boolean;
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
  schedulingText: string = CronWorkflowFormatter.toYamlString({}, true);

  constructor(
      private namespaceTracker: NamespaceTracker,
      private router: Router,
      public dialogRef: MatDialogRef<WorkflowExecuteDialogComponent>,
      @Inject(MAT_DIALOG_DATA) public data: WorkflowExecuteDialogData) {
    this.setManifest(data.manifest);
    if(data.cron) {
      this.showCron = true;
    }
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
      data['cron'] = CronWorkflowFormatter.fromYaml(this.schedulingText);
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
