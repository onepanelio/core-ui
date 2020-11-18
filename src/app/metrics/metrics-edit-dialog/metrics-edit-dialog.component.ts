import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Metric } from '../../../api';
import { MetricsEditComponent } from '../metrics-edit/metrics-edit.component';

export interface MetricEditDialogData {
  metrics: Array<Metric>;
}

@Component({
  selector: 'app-metric-edit-dialog',
  templateUrl: './metrics-edit-dialog.component.html',
  styleUrls: ['./metrics-edit-dialog.component.scss']
})
export class MetricsEditDialogComponent implements OnInit {
  @ViewChild(MetricsEditComponent, {static: false}) labelsEdit: MetricsEditComponent;

  metrics: Array<Metric>;

  constructor(
      public dialogRef: MatDialogRef<MetricsEditDialogComponent>,
      @Inject(MAT_DIALOG_DATA) public data: MetricEditDialogData) {
    this.metrics = data.metrics;
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

    this.dialogRef.close(this.metrics);
  }
}
