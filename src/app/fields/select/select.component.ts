import { Component, Input, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from "@angular/forms";
import { Parameter, ParameterOption } from "../../../api";

@Component({
  selector: 'app-select',
  templateUrl: './select.component.html',
  styleUrls: ['./select.component.scss']
})
export class SelectComponent implements OnInit {
  private _data: Parameter;
  options = new Array<ParameterOption>();

  @Input() disabled = false;
  @Input() form: FormGroup;
  @Input() set data(value: Parameter) {
    this._data = value;

    this.options = [];
    if(!value.options) {
      return;
    }

    for(let option of value.options) {
      if(option && option.name && option.value) {
        this.options.push(option);
      }
    }

    this.selectControl.setValue(this.data.value);
  }

  get data(): Parameter {
    return this._data;
  }

  selectControl: FormControl;

  constructor() {
    this.selectControl = new FormControl('');
  }

  ngOnInit() {
    if(this.data.required) {
      this.selectControl.setValidators([
        Validators.required
      ]);
    }

    this.form.addControl(this.data.name, this.selectControl);
  }
}
