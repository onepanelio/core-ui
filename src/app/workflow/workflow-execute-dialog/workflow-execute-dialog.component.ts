import { Component, Inject, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { FormComponent } from '../../fields/form/form.component';
import { KeyValue, Parameter, WorkflowTemplate, WorkflowTemplateServiceService, WorkspaceTemplate } from '../../../api';
import { MatCheckboxChange } from '@angular/material/checkbox';
import { CronWorkflowFormatter } from '../../cron-workflow/models';
import * as yaml from 'js-yaml';
import { Alert } from '../../alert/alert';
import { AppRouter } from '../../router/app-router.service';

export interface WorkflowExecuteDialogData {
  namespace: string;
  workflowTemplate?: WorkflowTemplate; // if provided, sets the current template
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
export class WorkflowExecuteDialogComponent implements OnInit, OnDestroy {
  state: WorkflowExecutionState = 'loading';

  alert: Alert;
  namespace = '';
  workflowTemplates: WorkflowTemplate[] = [];

  selectedWorkflowTemplateUid = '';
  // tslint:disable-next-line:variable-name
  private _selectedTemplate: WorkflowTemplate;
  set selectedTemplate(value: WorkflowTemplate) {
    this.selectedWorkflowTemplateUid = value.uid;
    this._selectedTemplate = value;

    if (value.manifest) {
      this.parameters = WorkflowExecuteDialogComponent.pluckParameters(value.manifest);
    }
  }
  get selectedTemplate(): WorkflowTemplate {
    return this._selectedTemplate;
  }

  @ViewChild(FormComponent, {static: false}) form: FormComponent;

  showCron = false;
  parameters: Array<Parameter> = [];
  labels = new Array<KeyValue>();
  schedulingText: string = CronWorkflowFormatter.toYamlString({}, true);

  constructor(
      private appRouter: AppRouter,
      private workflowTemplateSerivce: WorkflowTemplateServiceService,
      public dialogRef: MatDialogRef<WorkflowExecuteDialogComponent>,
      @Inject(MAT_DIALOG_DATA) public data: WorkflowExecuteDialogData) {
    if (data.labels) {
      this.labels = data.labels;
    }
    if (data.cron) {
      this.showCron = true;
    }

    if (data.workflowTemplate) {
      this.workflowTemplates = [data.workflowTemplate];
      this.selectedTemplate = data.workflowTemplate;
    } else {
      this.workflowTemplateSerivce.listWorkflowTemplates(data.namespace)
          .subscribe(res => {
            this.workflowTemplates = res.workflowTemplates;
            this.state = 'ready';
          });
    }

    // Parameters are set after setting workflow template to override any parameters it has
    if (data.parameters) {
      this.parameters = data.parameters;
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

    const data = {
      workflowExecution: {
        parameters: formattedParameters,
        labels: this.labels,
        workflowTemplate: this.selectedTemplate,
      },
      workflowTemplate: this.selectedTemplate,
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

  ngOnDestroy(): void {
  }

  onCronCheck(value: MatCheckboxChange) {
    this.showCron = value.checked;
  }

  getWorkflowTemplate(namespace: string, uid: string) {
    this.workflowTemplateSerivce.getWorkflowTemplate(namespace, uid).subscribe(res => {
      this.selectedTemplate = res;
    }, err => {
      this.alert = new Alert({
        type: 'danger',
        title: `Unable to get workflow template ${uid}`,
      });
    });
  }

  onSelectWorkflowTemplateUid(uid: string) {
    this.selectedWorkflowTemplateUid = uid;
    this.getWorkflowTemplate(this.data.namespace, uid);
  }

  goToWorkflowTemplates() {
    this.appRouter.navigateToWorkflowTemplates(this.namespace);
  }
}
