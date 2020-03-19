import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from "@angular/forms";

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

}
