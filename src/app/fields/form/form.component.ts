import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Parameter } from '../../../api';

@Component({
    selector: 'app-form',
    templateUrl: './form.component.html',
    styleUrls: ['./form.component.scss']
})
export class FormComponent implements OnInit {
    // tslint:disable-next-line:variable-name
    _fieldData = new Array<Parameter>();

    form: FormGroup;

    @Input() disabled = false;
    @Input() errors = {};

    @Input() set fieldData(value: Array<Parameter>) {
        this._fieldData = value;
    }

    get fieldData(): Array<Parameter> {
        return this._fieldData;
    }

    constructor(private formBuilder: FormBuilder) {
        this.form = this.formBuilder.group({});
    }

    ngOnInit() {
    }

    isFieldInput(fieldData: Parameter): boolean {
        if (!fieldData.type) {
            return true;
        }
        return fieldData.type.indexOf('input') >= 0;
    }

    getInputType(input?: string): string {
        if (!input) {
            return 'text';
        }

        const parts = input.split('.');

        if (parts.length === 0) {
            return '';
        }

        if (parts.length < 2) {
            return parts[0];
        }

        return parts[1];
    }
}
