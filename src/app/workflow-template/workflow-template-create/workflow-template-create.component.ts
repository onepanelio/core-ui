import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import {
  WorkflowTemplateDetail,
  WorkflowTemplateService
} from '../workflow-template.service';
import { ActivatedRoute } from '@angular/router';
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
import { KeyValue, WorkflowServiceService, WorkflowTemplateServiceService } from "../../../api";
import { LabelsEditComponent } from "../../labels/labels-edit/labels-edit.component";
import { ManifestDagEditorComponent } from "../../manifest-dag-editor/manifest-dag-editor.component";
import { AppRouter } from "../../router/app-router.service";
import { CanComponentDeactivate } from "../../guards/can-deactivate.guard";
import { Observable } from "rxjs";
import {
  ConfirmationDialogComponent,
  ConfirmationDialogData
} from "../../confirmation-dialog/confirmation-dialog.component";
import { MatDialog } from "@angular/material/dialog";
const aceRange = ace.acequire('ace/range').Range;

type WorkflowTemplateCreateState = 'new' | 'creating';

@Component({
  selector: 'app-workflow-template-create',
  templateUrl: './workflow-template-create.component.html',
  styleUrls: ['./workflow-template-create.component.scss'],
  providers: [WorkflowService, WorkflowTemplateService]
})
export class WorkflowTemplateCreateComponent implements OnInit, OnDestroy, CanComponentDeactivate {
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

  /**
   * manifestChanged keeps track if any changes have been made since the editor was opened.
   */
  manifestChanged = false;

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
      private snackBar: MatSnackBar,
      private dialogRef: MatDialog) { }

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

  canDeactivate(): Observable<boolean> | Promise<boolean> | boolean {
    if(!this.manifestChanged) {
      return true;
    }

    const confirmData: ConfirmationDialogData = {
      title: 'You have unsaved changes',
      message: 'You have unsaved changes in your template, leaving will discard them.',
      confirmText: 'DISCARD CHANGES',
      type: 'confirm'
    }

    const confirmDialog = this.dialogRef.open(ConfirmationDialogComponent, {
      data: confirmData
    })

    return confirmDialog.afterClosed();
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

    this.manifestChanged = false;

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

          this.manifestDagEditor.error = {
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

  onManifestTextModified(manifest: string) {
    // No need to update the change status again
    if(this.manifestChanged) {
      return;
    }

    if(manifest === this.manifestText) {
      this.manifestChanged = false;
      return;
    }

    this.manifestChanged = true;
  }
}
