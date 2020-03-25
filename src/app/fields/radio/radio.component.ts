import { Component, Input, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from "@angular/forms";

@Component({
  selector: 'app-radio',
  templateUrl: './radio.component.html',
  styleUrls: ['./radio.component.scss']
})
export class RadioComponent implements OnInit {
  private _data: FieldData;

  @Input() form: FormGroup;

  options = new Array<{name: string, value: string}>();

  labelId = '';

  @Input() set data(value: FieldData) {
    this._data = value;

    this.labelId = 'radio-group-' + value.name;

    this.options = [];
    if(!value.options) {
      return;
    }

    for(let option of value.options) {
      if(option.name && option.value) {
        this.options.push(option);
      }
    }
  }

  get data(): FieldData {
    return this._data;
  }

  radioControl: FormControl;

  constructor() {
    this.radioControl = new FormControl();
  }

  ngOnInit() {
    this.form.addControl(this.data.name, this.radioControl);

    this.radioControl.setValidators([
      Validators.required
    ]);
  }
}
