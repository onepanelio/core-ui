import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { KeyValue } from '../../../api';
import { LabelsEditComponent } from '../labels-edit/labels-edit.component';

export interface LabelEditDialogData {
  labels: Array<KeyValue>;
}

@Component({
  selector: 'app-label-edit-dialog',
  templateUrl: './label-edit-dialog.component.html',
  styleUrls: ['./label-edit-dialog.component.scss']
})
export class LabelEditDialogComponent implements OnInit {
  @ViewChild(LabelsEditComponent, {static: false}) labelsEdit: LabelsEditComponent;

  labels: Array<KeyValue>;

  constructor(
      public dialogRef: MatDialogRef<LabelEditDialogComponent>,
      @Inject(MAT_DIALOG_DATA) public data: LabelEditDialogData) {
    this.labels = data.labels;
  }

  ngOnInit() {
  }

  cancel() {
    this.dialogRef.close();
  }

  save() {
    if (!this.labelsEdit.isValid) {
      this.labelsEdit.markAllAsDirty();
      return;
    }

    this.dialogRef.close(this.labels);
  }
}
