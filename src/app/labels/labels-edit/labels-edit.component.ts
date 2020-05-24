import { Component, Input, OnInit } from '@angular/core';
import { KeyValue } from "../../../api";
import { FormControl, RequiredValidator, Validators } from "@angular/forms";

interface LabelItem {
  id: number;
  item: KeyValue;
  controlKey: FormControl;
  controlValue: FormControl;
}

@Component({
  selector: 'app-labels-edit',
  templateUrl: './labels-edit.component.html',
  styleUrls: ['./labels-edit.component.scss']
})
export class LabelsEditComponent implements OnInit {
  private nextId = 0;
  private _labels: Array<KeyValue>;

  displayedColumns = ['key', 'value', 'delete'];

  items = new Array<LabelItem>();

  @Input() set labels(value: Array<KeyValue>) {
    if(!value) {
      this.items = [];
      return;
    }

    this._labels = value;
    let newItems = new Array<LabelItem>();

    for(const item of value) {
      newItems.push({
        id: this.getNextId(),
        item: item,
        controlKey: this.createNewKeyControl(item.key),
        controlValue: this.createNewValueControl(item.value),
      });
    }

    this.items = newItems;
  }

  constructor() { }

  ngOnInit() {
  }

  onDelete(item: LabelItem) {
    this.items = this.items.filter((value, index) => {
      return value.id !== item.id;
    });

    let indexOfItem = this._labels.indexOf(item.item);
    if(indexOfItem >= 0) {
      this._labels.splice(indexOfItem, 1);
    }
  }

  onAdd() {
    let labelsPlusOne = this.items.slice();

    const newItem = {
      key: '',
      value: ''
    };

    labelsPlusOne.push({
      id: this.getNextId(),
      item: newItem,
      controlKey: this.createNewKeyControl(newItem.key),
      controlValue: this.createNewValueControl(newItem.value),
    });

    this.items = labelsPlusOne;
    this._labels.push(newItem);
  }

  onKeyChange(label: KeyValue, change: string) {
    label.key = change;
  }

  onValueChange(label: KeyValue, change: string) {
    label.value = change;
  }

  getNextId() {
    return this.nextId++;
  }

  get isValid(): boolean {
    for(const item of this.items) {
      if(item.controlKey.invalid) {
        return false;
      }

      if(item.controlValue.invalid) {
        return false;
      }
    }

    let duplicate = false;
    for(const duplicateKey of this.findDuplicateKeys()) {
      duplicateKey.controlKey.setErrors({'duplicate': true});
      duplicate = true;
    }

    if(duplicate) {
      return false;
    }

    return true;
  }

  private findDuplicateKeys(): LabelItem[] {
    let keyMap = new Map<string, LabelItem>();

    let duplicates = [];

    for(const item of this.items) {
      const key = item.controlKey.value;
      if(keyMap.has(key)) {
        duplicates.push(item);
      } else {
        keyMap.set(key, item);
      }
    }

    return duplicates;
  }

  markAllAsDirty() {
    for(const item of this.items) {
      item.controlKey.markAllAsTouched();
      item.controlValue.markAllAsTouched();
    }
  }

  private createNewKeyControl(value: string): FormControl {
    let control = new FormControl(value);
    control.setValidators([
        Validators.required
    ]);

    return control;
  }

  private createNewValueControl(value: string): FormControl {
    let control = new FormControl(value);
    control.setValidators([
      Validators.required
    ]);

    return control;
  }
}
