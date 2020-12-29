import { Component, Input, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Parameter } from '../../../api';

@Component({
    selector: 'app-textarea',
    templateUrl: './textarea.component.html',
    styleUrls: ['./textarea.component.scss']
})
export class TextareaComponent implements OnInit {
    @Input() data: Parameter;
    @Input() form: FormGroup;

    textAreaControl: FormControl;

    constructor() {
        this.textAreaControl = new FormControl('');
        this.textAreaControl.valueChanges.subscribe(newValue => {
            if (this.data) {
                this.data.value = newValue;
            }
        });
    }

    ngOnInit() {
        if (this.data.required) {
            this.textAreaControl.setValidators([
                Validators.required
            ]);
        }

        this.form.addControl(this.data.name, this.textAreaControl);
    }
}
