import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from "@angular/forms";

@Component({
  selector: 'app-form',
  templateUrl: './form.component.html',
  styleUrls: ['./form.component.scss']
})
export class FormComponent implements OnInit {
  _fieldData = new Array<FieldData>();

  form: FormGroup;

  @Input() set fieldData(value: Array<FieldData>) {
    this._fieldData = value;
  }

  get fieldData(): Array<FieldData> {
    return this._fieldData;
  }

  constructor(private formBuilder: FormBuilder) {
    this.form = this.formBuilder.group({});
  }

  ngOnInit() {
  }

  isFieldInput(fieldData: FieldData): boolean {
    if(!fieldData.type) {
      return true;
    }
    return fieldData.type.indexOf('input') > 0;
  }

  getInputType(input?: string): string {
    if(!input) {
      return 'text';
    }

    const parts = input.split('.');

    if(parts.length == 0) {
      return '';
    }

    if(parts.length < 2) {
      return parts[0];
    }

    return parts[1];
  }
}
