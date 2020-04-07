import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";
import { FormControl, Validators } from "@angular/forms";
import { WorkflowServiceService } from "../../../api";
import { HttpErrorResponse } from "@angular/common/http";

export interface WorkflowTemplateCloneData {
  title: string;
  inputLabel: string;
  defaultValue?: string;
  cancelText?: string;
  confirmText?: string;
  namespace: string;
  uid: string;
  version?: number;
}

@Component({
  selector: 'app-input-dialog',
  templateUrl: './workflow-template-clone-dialog.component.html',
  styleUrls: ['./workflow-template-clone-dialog.component.scss']
})
export class WorkflowTemplateCloneDialog implements OnInit {

  inputControl: FormControl;

  constructor(public dialogRef: MatDialogRef<WorkflowTemplateCloneDialog>,
              private workflowServiceService: WorkflowServiceService,
              @Inject(MAT_DIALOG_DATA) public data: WorkflowTemplateCloneData) { }

  ngOnInit() {
    this.data.cancelText = this.data.cancelText || 'cancel';
    this.data.confirmText = this.data.confirmText || 'confirm';
    this.data.defaultValue = this.data.defaultValue || '';

    this.inputControl = new FormControl(this.data.defaultValue);
    this.inputControl.setValidators([Validators.required])
  }

  onConfirm() {
    const name = this.inputControl.value;
    this.workflowServiceService.cloneWorkflowTemplate(this.data.namespace, this.data.uid, name, this.data.version)
        .subscribe(res => {
          this.dialogRef.close(res);
        }, (err: HttpErrorResponse) => {
          if(err.status === 409) {
            this.inputControl.setErrors({
              conflict: 'This name is already taken'
            });
          }
        });
  }

  onCancel() {
    this.dialogRef.close();
  }
}
