import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import {
  WorkflowTemplateDetail,
  WorkflowTemplateService
} from '../workflow-template.service';
import { ActivatedRoute, Router } from '@angular/router';
import { WorkflowService } from "../../workflow/workflow.service";
import {
  WorkflowTemplateSelectComponent,
  WorkflowTemplateSelected
} from "../../workflow-template-select/workflow-template-select.component";
import { MatSnackBar, MatSnackBarRef } from "@angular/material/snack-bar";
import { AbstractControl, FormBuilder, FormGroup, Validators } from "@angular/forms";
import { HttpErrorResponse } from "@angular/common/http";
import * as ace from 'brace';
import { ClosableSnackComponent } from "../../closable-snack/closable-snack.component";
import { Alert } from "../../alert/alert";
import { KeyValue, WorkflowServiceService, WorkflowTemplateServiceService } from "../../../api";
import { LabelsEditComponent } from "../../labels/labels-edit/labels-edit.component";
import { ManifestDagEditorComponent } from "../../manifest-dag-editor/manifest-dag-editor.component";
import { AppRouter } from "../../router/app-router.service";
const aceRange = ace.acequire('ace/range').Range;

type WorkflowTemplateCreateState = 'new' | 'creating';

@Component({
  selector: 'app-workflow-template-create',
  templateUrl: './workflow-template-create.component.html',
  styleUrls: ['./workflow-template-create.component.scss'],
  providers: [WorkflowService, WorkflowTemplateService]
})
export class WorkflowTemplateCreateComponent implements OnInit, OnDestroy {
  private snackbarRefs: Array<MatSnackBarRef<any>> = [];

  @ViewChild(WorkflowTemplateSelectComponent, {static: false}) workflowTemplateSelect: WorkflowTemplateSelectComponent;
  @ViewChild(ManifestDagEditorComponent, {static: false}) manifestDagEditor: ManifestDagEditorComponent;
  @ViewChild(LabelsEditComponent, {static: false}) labelEditor: LabelsEditComponent;

  previousManifestText: string;
  manifestText: string;
  state: WorkflowTemplateCreateState = 'new';
  loading = true;

  namespace: string;

  templateNameInput: AbstractControl;
  form: FormGroup;
  labels = new Array<KeyValue>();

  private workflowTemplateDetail: WorkflowTemplateDetail;

  get workflowTemplate(): WorkflowTemplateDetail {
    return this.workflowTemplateDetail;
  }

  set workflowTemplate(value: WorkflowTemplateDetail) {
    this.workflowTemplateDetail = value;
  }

  constructor(
      private formBuilder: FormBuilder,
      private appRouter: AppRouter,
      private activatedRoute: ActivatedRoute,
      private workflowService: WorkflowService,
      private workflowTemplateService: WorkflowTemplateService,
      private workflowTemplateServiceService: WorkflowTemplateServiceService,
      private workflowServiceService: WorkflowServiceService,
      private snackBar: MatSnackBar) { }

  ngOnInit() {
    this.form = this.formBuilder.group({
      templateNameInput: [
        '',
        Validators.compose([
          Validators.required,
        ]),
      ]});

    this.templateNameInput = this.form.get('templateNameInput');

    this.activatedRoute.paramMap.subscribe(next => {
      this.namespace = next.get('namespace');
    });
  }

  ngOnDestroy(): void {
    for(const snackbarRef of this.snackbarRefs) {
      snackbarRef.dismiss();
    }
  }

  save() {
    const templateName = this.templateNameInput.value;

    if(!templateName) {
      const snackbarRef = this.snackBar.open('Unable to update - template name is invalid', 'OK');
      this.snackbarRefs.push(snackbarRef);

      return;
    }

    if(!this.labelEditor.isValid) {
      this.labelEditor.markAllAsDirty();
      return;
    }

    this.state = 'creating';
    const manifestText = this.manifestDagEditor.manifestTextCurrent;
    this.workflowTemplateServiceService
        .createWorkflowTemplate(this.namespace, {
          name: templateName,
          manifest: manifestText,
          labels: this.labels
        })
        .subscribe(res => {
          this.appRouter.navigateToWorkflowTemplateView(this.namespace, res.uid);
          this.state = 'new';
        }, (err: HttpErrorResponse) => {
          this.state = 'new';

          if(err.status === 409) {
            this.templateNameInput.setErrors({
              conflict: 'true',
            });

            return;
          }

          this.manifestDagEditor.serverError = {
            message: err.error.message,
            type: 'danger',
          };
    });
  }

  cancel() {
    this.appRouter.navigateToWorkflowTemplates(this.namespace);
  }

  onTemplateSelected(template: WorkflowTemplateSelected) {
    this.previousManifestText = this.manifestDagEditor.manifestTextCurrent;
    this.manifestText = template.manifest;

    const snackUndo = this.snackBar.openFromComponent(ClosableSnackComponent, {
      data: {
        message: 'Template changed',
        action: 'Undo',
      },
    });

    snackUndo.onAction().subscribe(res => {
      this.workflowTemplateSelect.undo();
      this.manifestText = this.previousManifestText;
    });

    this.snackbarRefs.push(snackUndo);
  }
}
