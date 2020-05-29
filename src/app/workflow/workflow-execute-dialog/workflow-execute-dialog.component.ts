import { Component, Inject, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";
import * as yaml from 'js-yaml';
import { NamespaceTracker } from "../../namespace/namespace-tracker.service";
import { Router } from "@angular/router";
import { FormComponent } from "../../fields/form/form.component";
import { KeyValue, Parameter } from "../../../api";
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

    if(res && res.arguments && res.arguments.parameters) {
      for(const param of res.arguments.parameters) {
        if(param && typeof param === 'object') {
          parameters.push(param);
        }
      }
    }

    return parameters;
  }

  @ViewChild(FormComponent, {static: false}) form: FormComponent;

  showCron = false;
  parameters: Array<Parameter> = [];
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
    let formattedParameters = [];
    for(let parameter of this.parameters) {
      // convert all the parameters to string
      parameter.value = parameter.value.toString();
      formattedParameters.push(parameter);
    }

    let data = {
      workflowExecution: {
        parameters: formattedParameters,
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
