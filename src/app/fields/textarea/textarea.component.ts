import { Component, Input, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from "@angular/forms";

@Component({
  selector: 'app-textarea',
  templateUrl: './textarea.component.html',
  styleUrls: ['./textarea.component.scss']
})
export class TextareaComponent implements OnInit {
  @Input() data: FieldData;
  @Input() form: FormGroup;

  textAreaControl: FormControl;

  constructor() {
    this.textAreaControl = new FormControl('')
  }

  ngOnInit() {
    this.textAreaControl.setValidators([
      Validators.required
    ]);

    this.form.addControl(this.data.name, this.textAreaControl);
  }
}
