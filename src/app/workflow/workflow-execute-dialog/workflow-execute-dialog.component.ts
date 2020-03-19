import { Component, Inject, Input, OnInit, ViewChild } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";
import * as yaml from 'js-yaml';
import { AbstractControl, FormBuilder, FormGroup, Validators } from "@angular/forms";
import { NamespaceTracker } from "../../namespace/namespace-tracker.service";
import { Router } from "@angular/router";
import { FormComponent } from "../../fields/form/form.component";

export interface WorkflowExecuteDialogData {
  manifest: string;
}

@Component({
  selector: 'app-workflow-execute-dialog',
  templateUrl: './workflow-execute-dialog.component.html',
  styleUrls: ['./workflow-execute-dialog.component.scss']
})
export class WorkflowExecuteDialogComponent implements OnInit {
  public static pluckParameters(manifest) {
    const res = yaml.safeLoad(manifest);
    const parameters = [];

    if(res && res.spec && res.spec.arguments && res.spec.arguments.parameters) {
      for(const param of res.spec.arguments.parameters) {
        parameters.push({
          name: param.name,
          value: param.value,
          type: param.type,
          options: param.options
        });
      }
    }

    return parameters;
  }

  @ViewChild(FormComponent, {static: false}) form: FormComponent;

  parameters: Array<FieldData> = [];

  constructor(
      private namespaceTracker: NamespaceTracker,
      private router: Router,
      private formBuilder: FormBuilder,
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
    const data = {
      parameters: this.parameters,
    };

    return data;
  }

  cancel() {
    this.dialogRef.close();
  }

  execute() {
    if(!this.form.form.valid) {
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
}
