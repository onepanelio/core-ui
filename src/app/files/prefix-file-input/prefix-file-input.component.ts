import { Component, Input, OnInit } from '@angular/core';
import { AbstractControl, FormControl } from '@angular/forms';

@Component({
  selector: 'app-prefix-file-input',
  templateUrl: './prefix-file-input.component.html',
  styleUrls: ['./prefix-file-input.component.scss']
})
export class PrefixFileInputComponent implements OnInit {
  // tslint:disable-next-line:variable-name
  _prefixes = new Array<string>();
  get prefixes(): string[] {
    return this._prefixes;
  }
  @Input() set prefixes(value: string[]) {
    this._prefixes = value;

    if (this.prefixSelect && value.length !== 0) {
      this.prefixSelect.setValue(this._prefixes[0]);
    }
  }

  @Input() control: FormControl|AbstractControl;

  prefixSelect: FormControl;
  pathInput: FormControl;

  constructor() { }

  ngOnInit() {
    this.prefixSelect = new FormControl();
    if (this.prefixes.length !== 0) {
      this.prefixSelect.setValue(this.prefixes[0]);
    }

    this.pathInput = new FormControl('');

    this.prefixSelect.valueChanges.subscribe(() => {
      this.updateFormControl();
    });

    this.pathInput.valueChanges.subscribe(() => {
      this.updateFormControl();
    });
  }

  private updateFormControl() {
    const path = this.prefixSelect.value + '/' + this.pathInput.value;

    if (this.control) {
      this.control.setValue(path);
    }
  }
}
