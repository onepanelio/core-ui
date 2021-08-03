import { Component, Input, OnInit } from '@angular/core';
import { Parameter } from '../../../api';
import { FormControl, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-checkbox',
  templateUrl: './checkbox.component.html',
  styleUrls: ['./checkbox.component.scss']
})
export class CheckboxComponent implements OnInit {
  // tslint:disable-next-line:variable-name
  private _data: Parameter;

  @Input() set errors(errors: any) {
    if (!this._data || !this.inputControl) {
      return;
    }

    const hasError = errors[this.data.name] && errors[this.data.name] === 'conflict';
    if (hasError) {
      this.inputControl.setErrors({
        conflict: true,
      });

      this.inputControl.markAllAsTouched();
    }
  }

  @Input() set data(value: Parameter) {
    this._data = value;
    this.inputControl.setValue(value.value === 'true');
  }

  get data(): Parameter {
    return this._data;
  }

  @Input() form: FormGroup;
  inputControl: FormControl;

  constructor() {
    this.inputControl = new FormControl();
    this.inputControl.valueChanges.subscribe(newValue => {
      if (this._data) {
        this._data.value = newValue;
      }
    });
  }

  ngOnInit() {
    this.setupForm();
  }

  setupForm() {
    if (this.data.required) {
      this.inputControl.setValidators([
        Validators.required
      ]);
    }

    this.form.addControl(this.data.name, this.inputControl);
  }

  setDataValue(value: string) {
    setTimeout(() => {
      this._data.value = value;
    });
  }
}
