import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";
import { WorkflowExecuteComponent } from "../workflow-execute/workflow-execute.component";

export interface WorkflowExecuteDialogData {
  manifest: string;
}

@Component({
  selector: 'app-workflow-execute-dialog',
  templateUrl: './workflow-execute-dialog.component.html',
  styleUrls: ['./workflow-execute-dialog.component.scss']
})
export class WorkflowExecuteDialogComponent implements OnInit {
  @ViewChild(WorkflowExecuteComponent, {static: false}) workflowExecute: WorkflowExecuteComponent;

  constructor(
      public dialogRef: MatDialogRef<WorkflowExecuteDialogComponent>,
      @Inject(MAT_DIALOG_DATA) public data: WorkflowExecuteDialogData) { }

  ngOnInit() {
  }

  cancel() {
    this.dialogRef.close();
  }

  execute() {
    const data = this.workflowExecute.getData();

    this.dialogRef.close(data);
  }
}
