import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";

export type ConfirmationDialogType = 'confirm' | 'delete';

export interface ConfirmationDialogData {
  title: string;
  message?: string;
  cancelText?: string;
  confirmText?: string;
  type?: ConfirmationDialogType;
}

@Component({
  selector: 'app-confirmation-dialog',
  templateUrl: './confirmation-dialog.component.html',
  styleUrls: ['./confirmation-dialog.component.scss']
})
export class ConfirmationDialogComponent implements OnInit {
  constructor(
      public dialogRef: MatDialogRef<ConfirmationDialogComponent>,
      @Inject(MAT_DIALOG_DATA) public data: ConfirmationDialogData
  ) { }

  ngOnInit() {
    if (!this.data.cancelText) {
      this.data.cancelText = 'CANCEL';
    }

    if (!this.data.confirmText) {
      this.data.confirmText = 'OK';
    }

    if(!this.data.type) {
      this.data.type = 'confirm';
    }
  }

  onCancel() {
    this.dialogRef.close(false);
  }

  onConfirm() {
    this.dialogRef.close(true);
  }
}
