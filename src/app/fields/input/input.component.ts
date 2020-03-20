import { Component, Input, OnInit } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, Validators } from "@angular/forms";

@Component({
  selector: 'app-input',
  templateUrl: './input.component.html',
  styleUrls: ['./input.component.scss']
})
export class InputComponent implements OnInit {
  private _data: FieldData;

  @Input() set data(value: FieldData) {
    this._data = value;

    if(value.inputType) {
      this.inputType = value.inputType;
    }
  }
  get data(): FieldData {
    return this._data;
  }


  @Input() form: FormGroup;
  inputControl: FormControl;
  inputType = 'text';

  constructor() {
    this.inputControl = new FormControl('');
  }


  ngOnInit() {
    this.setupForm();
  }

  setupForm() {
    if(this.data.required) {
      this.inputControl.setValidators([
        Validators.required
      ]);
    }

    this.form.addControl(this.data.name, this.inputControl);
  }

  setDataValue(value: string) {
    this._data.value = value;
  }
}
