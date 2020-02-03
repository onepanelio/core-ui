import { Component, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import * as yaml from 'js-yaml';
import { MatCheckbox } from "@angular/material/checkbox";

@Component({
    selector: 'app-workflow-execute',
    templateUrl: './workflow-execute.component.html',
    styleUrls: ['./workflow-execute.component.scss'],
})
export class WorkflowExecuteComponent implements OnInit, OnDestroy {
    @ViewChild(MatCheckbox, {static: true}) environmentCheckbox: MatCheckbox;

    public static pluckParameters(manifest) {
        const res = yaml.safeLoad(manifest);
        const parameters = [];

        if(res && res.spec && res.spec.arguments && res.spec.arguments.parameters) {
            for(const param of res.spec.arguments.parameters) {
                parameters.push(param.name);
            }
        }

        return parameters;
    }

    @Input() set manifest(value: string) {
        const parameters = WorkflowExecuteComponent.pluckParameters(value);

        console.log(value);

        for(const parameterName of parameters) {
            this.parameters.push({
                name: parameterName,
                value: '',
            })
        }
    }
    parameters: Array<{name: string, value: string}> = [];

    ngOnInit(): void {
    }

    ngOnDestroy(): void {
    }

    getData() {
        const data = {
            parameters: this.parameters,
            environment: this.environmentCheckbox.checked,
        };

        return data;
    }
}
