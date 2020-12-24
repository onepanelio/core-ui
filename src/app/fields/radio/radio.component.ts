import { Component, Input, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Parameter, ParameterOption } from '../../../api';

@Component({
    selector: 'app-radio',
    templateUrl: './radio.component.html',
    styleUrls: ['./radio.component.scss']
})
export class RadioComponent implements OnInit {
    // tslint:disable-next-line:variable-name
    private _data: Parameter;

    @Input() form: FormGroup;

    options = new Array<ParameterOption>();

    radioControl: FormControl;
    labelId = '';

    @Input() set data(value: Parameter) {
        this._data = value;

        this.labelId = 'radio-group-' + value.name;

        this.options = [];
        if (!value.options) {
            return;
        }

        for (const option of value.options) {
            if (option.name && option.value) {
                this.options.push(option);
            }
        }
    }

    get data(): Parameter {
        return this._data;
    }

    constructor() {
        this.radioControl = new FormControl();
        this.radioControl.valueChanges.subscribe(newValue => {
            this._data.value = newValue;
        });
    }

    ngOnInit() {
        this.form.addControl(this.data.name, this.radioControl);

        if (this.data.required) {
            this.radioControl.setValidators([
                Validators.required
            ]);
        }
    }
}
