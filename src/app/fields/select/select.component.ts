import { Component, Input, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from "@angular/forms";

@Component({
  selector: 'app-select',
  templateUrl: './select.component.html',
  styleUrls: ['./select.component.scss']
})
export class SelectComponent implements OnInit {
  private _data: FieldData;
  options = new Array<{name: string, value: string}>();

  @Input() form: FormGroup;
  @Input() set data(value: FieldData) {
    this._data = value;

    this.options = [];
    if(!value.options) {
      return;
    }

    for(let option of value.options) {
      if(option.name && option.value) {
        this.options.push(option);
      }
    }

    this.selectControl.setValue(this.data.value);
  }

  get data(): FieldData {
    return this._data;
  }

  selectControl: FormControl;

  constructor() {
    this.selectControl = new FormControl('');
  }

  ngOnInit() {
    this.selectControl.setValidators([
      Validators.required
    ]);

    this.form.addControl(this.data.name, this.selectControl);
  }
}
