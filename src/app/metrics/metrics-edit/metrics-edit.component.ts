import { Component, Input, OnInit } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { Metric } from '../../../api';
import { MatOption } from '@angular/material';

interface MetricItem {
  id: number;
  item: Metric;
  controlName: FormControl;
  controlValue: FormControl;
  controlFormat: FormControl;
}

@Component({
  selector: 'app-metrics-edit',
  templateUrl: './metrics-edit.component.html',
  styleUrls: ['./metrics-edit.component.scss']
})
export class MetricsEditComponent implements OnInit {
  private nextId = 0;

  // tslint:disable-next-line:variable-name
  private _metrics: Array<Metric>;

  displayedColumns = ['key', 'value', 'format', 'delete'];

  items = new Array<MetricItem>();

  @Input() set metrics(value: Array<Metric>) {
    if (!value) {
      this.items = [];
      return;
    }

    this._metrics = value;
    const newItems = new Array<MetricItem>();

    for (const item of value) {
      newItems.push({
        id: this.getNextId(),
        item,
        controlName: this.createNewNameControl(item.name),
        controlValue: this.createNewValueControl(item.value),
        controlFormat: this.createNewFormatControl(item.format),
      });
    }

    this.items = newItems;
  }

  constructor() { }

  ngOnInit() {
  }

  onDelete(item: MetricItem) {
    this.items = this.items.filter((value, index) => {
      return value.id !== item.id;
    });

    const indexOfItem = this._metrics.indexOf(item.item);
    if (indexOfItem >= 0) {
      this._metrics.splice(indexOfItem, 1);
    }
  }

  onAdd() {
    const metricsPlusOne = this.items.slice();

    const newItem = {
      name: '',
      value: 0.0,
      format: ''
    };

    metricsPlusOne.push({
      id: this.getNextId(),
      item: newItem,
      controlName: this.createNewNameControl(newItem.name),
      controlValue: this.createNewValueControl(newItem.value),
      controlFormat: this.createNewFormatControl(newItem.format),
    });

    this.items = metricsPlusOne;
    this._metrics.push(newItem);
  }

  onNameChange(metric: Metric, change: string) {
    metric.name = change;
  }

  onValueChange(metric: Metric, change: string) {
    metric.value = parseFloat(change);
  }

  onFormatChange(metric: Metric, change: string) {
    metric.format = change;
  }

  onFormatChangeOption(metric: Metric, val: MatOption|MatOption[]) {
    if (val instanceof MatOption) {
      this.onFormatChange(metric, val.value);
    }
  }

  getNextId() {
    return this.nextId++;
  }

  get isValid(): boolean {
    for (const item of this.items) {
      if (item.controlName.invalid) {
        return false;
      }

      if (item.controlValue.invalid) {
        return false;
      }

      if (item.controlFormat.invalid) {
        return false;
      }
    }

    return true;
  }

  markAllAsDirty() {
    for (const item of this.items) {
      item.controlName.markAllAsTouched();
      item.controlValue.markAllAsTouched();
      item.controlFormat.markAllAsTouched();
    }
  }

  private createNewNameControl(value: string): FormControl {
    const control = new FormControl(value);
    control.setValidators([
      Validators.required
    ]);

    return control;
  }

  private createNewValueControl(value: number): FormControl {
    const control = new FormControl(value);
    control.setValidators([
      Validators.required
    ]);

    return control;
  }

  private createNewFormatControl(value: string): FormControl {
    if (!value) {
      value = 'none';
    }

    if (value === '%') {
      value = 'percent';
    }

    const control = new FormControl(value);
    control.setValidators([
      Validators.required
    ]);

    return control;
  }
}
