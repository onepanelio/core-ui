import { Component, Input, OnInit } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, Validators } from "@angular/forms";

@Component({
  selector: 'app-input',
  templateUrl: './input.component.html',
  styleUrls: ['./input.component.scss']
})
export class InputComponent implements OnInit {
  @Input() data: FieldData;
  @Input() form: FormGroup;
  inputControl: FormControl;

  constructor() {
    this.inputControl = new FormControl('');
  }


  ngOnInit() {
    this.setupForm();
  }

  setupForm() {
    this.inputControl.setValidators([
      Validators.required
    ]);

    this.form.addControl(this.data.name, this.inputControl);
  }

}
