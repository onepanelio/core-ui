import { Component, Inject, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { FormComponent } from '../../fields/form/form.component';
import { KeyValue, Parameter, WorkflowTemplate, WorkflowTemplateServiceService } from '../../../api';
import { MatCheckboxChange } from '@angular/material/checkbox';
import { CronWorkflowFormatter } from '../../cron-workflow/models';
import { Alert } from '../../alert/alert';
import { AppRouter } from '../../router/app-router.service';
import { ParameterUtils } from '../../parameters/models';
import * as yaml from 'js-yaml';

export interface WorkflowExecuteDialogData {
    namespace: string;
    workflowTemplate?: WorkflowTemplate; // if provided, sets the current template
    // if true, this will load the workflow template from the network and override the provided data
    loadWorkflowTemplate?: boolean;
    cron: boolean;
    parameters?: Parameter[]; // if provided, uses the parameters as the current ones
    labels?: KeyValue[]; // if provided, automatically sets the labels
}

type WorkflowExecutionState = 'loading' | 'ready' | 'creating';

@Component({
    selector: 'app-workflow-execute-dialog',
    templateUrl: './workflow-execute-dialog.component.html',
    styleUrls: ['./workflow-execute-dialog.component.scss']
})
export class WorkflowExecuteDialogComponent implements OnInit {
    @ViewChild(FormComponent, {static: false}) form: FormComponent;

    disableTemplates = false;

    state: WorkflowExecutionState = 'loading';

    alert: Alert;
    namespace = '';

    workflowTemplates: WorkflowTemplate[] = [];
    workflowTemplateVersions: WorkflowTemplate[] = [];
    selectedWorkflowTemplateUid = '';
    selectedWorkflowTemplateVersionVersion = '';

    showCron = false;
    parameters: Array<Parameter> = [];
    labels = new Array<KeyValue>();
    schedulingText: string = CronWorkflowFormatter.toYamlString({}, true);

    // tslint:disable-next-line:variable-name
    private _selectedTemplate: WorkflowTemplate;
    get selectedTemplate(): WorkflowTemplate {
        return this._selectedTemplate;
    }

    // tslint:disable-next-line:variable-name
    _selectedWorkflowTemplateVersion: WorkflowTemplate;
    set selectedWorkflowTemplateVersion(value: WorkflowTemplate) {
        this._selectedWorkflowTemplateVersion = value;
        this.selectedWorkflowTemplateVersionVersion = value.version;

        if (value.parameters) {
            this.parameters = value.parameters;
        } else {
            this.parameters = [];
        }

        if (this.data.parameters) {
            this.parameters = ParameterUtils.combineValueAndTemplate(this.data.parameters, this.parameters);
        }
    }
    get selectedWorkflowTemplateVersion(): WorkflowTemplate {
        return this._selectedWorkflowTemplateVersion;
    }

    constructor(
        private appRouter: AppRouter,
        private workflowTemplateService: WorkflowTemplateServiceService,
        public dialogRef: MatDialogRef<WorkflowExecuteDialogComponent>,
        @Inject(MAT_DIALOG_DATA) public data: WorkflowExecuteDialogData) {
        this.namespace = data.namespace;

        if (data.labels) {
            this.labels = data.labels;
        }
        if (data.cron) {
            this.showCron = true;
        }

        if (data.workflowTemplate) {
            this.disableTemplates = true;
            this.workflowTemplates = [data.workflowTemplate];
            this.setSelectedTemplate(data.workflowTemplate, data.workflowTemplate.version);
        } else {
            this.workflowTemplateService.listWorkflowTemplates(data.namespace)
                .subscribe(res => {
                    this.workflowTemplates = res.workflowTemplates;
                    this.state = 'ready';
                });
        }
    }

    public static pluckParameters(manifest) {
        const res = yaml.safeLoad(manifest);
        const parameters = [];

        if (res && res.arguments && res.arguments.parameters) {
            for (const param of res.arguments.parameters) {
                if (param && typeof param === 'object') {
                    parameters.push(param);
                }
            }
        }

        return parameters;
    }

    setSelectedTemplate(value: WorkflowTemplate, version?: string) {
        this._selectedTemplate = value;
        this.selectedWorkflowTemplateUid = value.uid;

        this.getWorkflowTemplateVersions(this.namespace, value.uid, version);
    }

    ngOnInit() {
    }

    getData() {
        const formattedParameters = [];
        for (const parameter of this.parameters) {
            // convert all the parameters to string
            if (!parameter.value) {
                parameter.value = '';
            } else {
                parameter.value = parameter.value.toString();
            }

            formattedParameters.push(parameter);
        }

        const finalTemplate = this.selectedWorkflowTemplateVersion;
        finalTemplate.uid = this.selectedTemplate.uid;

        const data = {
            workflowExecution: {
                parameters: formattedParameters,
                labels: this.labels,
                workflowTemplate: finalTemplate,
            },
            workflowTemplate: finalTemplate,
            cron: undefined,
        };

        if (this.showCron) {
            data.cron = CronWorkflowFormatter.fromYaml(this.schedulingText);
        }

        return data;
    }

    cancel() {
        this.dialogRef.close();
    }

    execute() {
        if (!this.form.form.valid) {
            this.form.form.markAllAsTouched();
            return;
        }

        const data = this.getData();

        if (!data) {
            return;
        }

        this.dialogRef.close(data);
    }

    goToEnvironmentVariables() {
        this.dialogRef.afterClosed().subscribe(() => {
            this.appRouter.navigateToSettings(this.namespace);
        });

        this.dialogRef.close();
    }

    onCronCheck(value: MatCheckboxChange) {
        this.showCron = value.checked;
    }

    onSelectWorkflowTemplateUid(uid: string) {
        this.workflowTemplateVersions = [];
        this.parameters = [];

        const foundTemplate = this.workflowTemplates.find(wt => wt.uid === uid);
        if (foundTemplate) {
            this.setSelectedTemplate(foundTemplate);
        }
    }

    goToWorkflowTemplates() {
        this.appRouter.navigateToWorkflowTemplates(this.namespace);
    }

    onSelectWorkflowTemplateVersion(version: string) {
        const foundVersion = this.workflowTemplateVersions.find(res => res.version === version);
        if (foundVersion) {
            this.selectedWorkflowTemplateVersion = foundVersion;
        }
    }

    getWorkflowTemplateVersions(namespace: string, workflowTemplateUid: string, version?: string) {
        this.state = 'loading';

        this.parameters = [];
        this.workflowTemplateService.listWorkflowTemplateVersions(namespace, workflowTemplateUid)
            .subscribe(res => {
                this.workflowTemplateVersions = res.workflowTemplates;

                if (!res.workflowTemplates || res.workflowTemplates.length === 0) {
                    this.state = 'ready';
                    return;
                }

                if (!version) {
                    this.selectedWorkflowTemplateVersion = res.workflowTemplates[0];
                } else {
                    const foundVersion = res.workflowTemplates.find(wtv => wtv.version === version);
                    if (foundVersion) {
                        this.selectedWorkflowTemplateVersion = foundVersion;
                    }
                }

                this.state = 'ready';
            }, err => {
                this.state = 'ready';
            });
    }
}
