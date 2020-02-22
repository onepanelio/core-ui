import { Component, Inject, Input, OnInit, ViewChild } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";
import * as yaml from 'js-yaml';
import { AbstractControl, FormBuilder, FormGroup, Validators } from "@angular/forms";
import { NamespaceTracker } from "../../namespace/namespace-tracker.service";
import { Router } from "@angular/router";

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
        });
      }
    }

    return parameters;
  }

  form: FormGroup;
  parameters: Array<{name: string, value: string}> = [];
  inputControls: Array<AbstractControl> = [];

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
    this.inputControls = [];

    let controlsConfig = {};
    for(let parameter of this.parameters) {
      controlsConfig[parameter.name] = [
        '',
        Validators.compose([
          Validators.required,
        ])
      ]
    }

    this.form = this.formBuilder.group(controlsConfig);

    for(let parameter of this.parameters) {
      this.inputControls.push(this.form.get(parameter.name));
    }
  }

  getData() {
    let hasErrors = false;

    for(let control of this.inputControls) {
      if (!control.value || control.value.length === 0) {
        hasErrors = true;
        control.markAllAsTouched();
      }
    }

    if (hasErrors) {
      return null;
    }

    const data = {
      parameters: this.parameters,
    };

    return data;
  }

  cancel() {
    this.dialogRef.close();
  }

  execute() {
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
