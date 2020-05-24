import { Component, Input, OnInit } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, Validators } from "@angular/forms";
import { Parameter } from "../../../api";

@Component({
  selector: 'app-input',
  templateUrl: './input.component.html',
  styleUrls: ['./input.component.scss']
})
export class InputComponent implements OnInit {
  private _data: Parameter;

  @Input() set errors(errors: any) {
    if(!this._data || !this.inputControl) {
      return;
    }

    const hasError = errors[this.data.name] && errors[this.data.name] === 'conflict';
    if(hasError) {
      this.inputControl.setErrors({
        conflict: true,
      });

      this.inputControl.markAllAsTouched();
    }
  }

  @Input() inputType: string = 'text';

  @Input() set data(value: Parameter) {
    this._data = value;
  }
  get data(): Parameter {
    return this._data;
  }


  @Input() form: FormGroup;
  inputControl: FormControl;

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
    setTimeout( () => {
      this._data.value = value;
    });
  }
}
