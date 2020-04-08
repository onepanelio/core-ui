import { Component, OnInit, ViewChild } from '@angular/core';
import {
  WorkflowTemplateDetail,
  WorkflowTemplateService
} from '../workflow-template.service';
import { DagComponent } from '../../dag/dag.component';
import { ActivatedRoute, Router } from '@angular/router';
import { NodeRenderer } from '../../node/node.service';
import { WorkflowService } from "../../workflow/workflow.service";
import { MatSnackBar, MatSnackBarRef, SimpleSnackBar } from "@angular/material/snack-bar";
import { AbstractControl, FormBuilder, FormGroup, Validators } from "@angular/forms";
import { HttpErrorResponse } from "@angular/common/http";
import { AceEditorComponent } from "ng2-ace-editor";
import * as yaml from 'js-yaml';
import * as ace from 'brace';
import { Alert } from "../../alert/alert";
import { KeyValue, WorkflowServiceService } from "../../../api";
import { LabelsEditComponent } from "../../labels/labels-edit/labels-edit.component";
import { AppRouter } from "../../router/app-router.service";
const aceRange = ace.acequire('ace/range').Range;

@Component({
  selector: 'app-workflow-template-clone',
  templateUrl: './workflow-template-clone.component.html',
  styleUrls: ['./workflow-template-clone.component.scss'],
  providers: [WorkflowService, WorkflowTemplateService]
})
export class WorkflowTemplateCloneComponent implements OnInit {
  private snackbarRefs: Array<MatSnackBarRef<any>> = [];

  @ViewChild(AceEditorComponent, {static:false}) codeEditor: AceEditorComponent;
  @ViewChild(DagComponent, {static: false}) dag: DagComponent;
  @ViewChild(LabelsEditComponent, {static: false}) labelEditor: LabelsEditComponent;

  manifestText: string;
  manifestTextCurrent: string;
  serverError: Alert;

  namespace: string;

  templateNameInput: AbstractControl;
  form: FormGroup;
  labels = new Array<KeyValue>();
  sourceWorkflowTemplateUid: string;

  private errorMarkerId;
  private workflowTemplateDetail: WorkflowTemplateDetail;


  get workflowTemplate(): WorkflowTemplateDetail {
    return this.workflowTemplateDetail;
  }

  set workflowTemplate(value: WorkflowTemplateDetail) {
    if (!this.dag) {
      setTimeout( () => this.workflowTemplate = value, 500);
      return;
    }

    this.workflowTemplateDetail = value;
    const g = NodeRenderer.createGraphFromManifest(value.manifest);
    this.dag.display(g);

    this.manifestText = value.manifest;
    this.manifestTextCurrent = value.manifest;
  }

  constructor(
      private formBuilder: FormBuilder,
      private router: Router,
      private appRouter: AppRouter,
      private activatedRoute: ActivatedRoute,
      private workflowService: WorkflowService,
      private workflowTemplateService: WorkflowTemplateService,
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
      this.sourceWorkflowTemplateUid = next.get('uid');

      this.getSourceWorkflowTemplate(this.sourceWorkflowTemplateUid);
      this.getSourceWorkflowLabels(this.sourceWorkflowTemplateUid);
    });
  }

  ngOnDestroy(): void {
    for(const snackbarRef of this.snackbarRefs) {
      snackbarRef.dismiss();
    }
  }

  onManifestChange(newManifest: string) {
    this.manifestTextCurrent = newManifest;

    if(newManifest === '') {
      this.dag.clear();
      return;
    }

    if(this.errorMarkerId) {
      this.codeEditor.getEditor().session.removeMarker(this.errorMarkerId)
    }

    try {
      const g = NodeRenderer.createGraphFromManifest(newManifest);
      this.dag.display(g);
      this.setServerError(null);
    } catch (e) {
      if(e instanceof yaml.YAMLException) {
        const line = e.mark.line + 1;
        const column = e.mark.column + 1;

        const codeErrorRange = new aceRange(line - 1, 0, line - 1, column);
        this.errorMarkerId = this.codeEditor.getEditor().session.addMarker(codeErrorRange, "highlight-error", "fullLine");

        this.setServerError({
          message: e.reason + " at line: " + line + " column: " + column,
          type: 'danger'
        });
      }
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

    this.workflowTemplateService
        .create(this.namespace, {
          name: templateName,
          manifest: this.manifestTextCurrent,
        })
        .subscribe(res => {
          this.workflowServiceService.replaceWorkflowTemplateLabels(this.namespace, res.uid, {
            items: this.labels
          }).subscribe( labelRes => {
            // Do nothing
          }, err => {
            // Do nothing
          }, () => {
            this.router.navigate(['/', this.namespace, 'workflow-templates', res.uid]);
          })
        }, (err: HttpErrorResponse) => {
          if(err.status === 409) {
            this.templateNameInput.setErrors({
              conflict: 'true',
            });

            return;
          }

          this.serverError = {
            message: err.error.message,
            type: 'danger',
          };
        });
  }

  cancel() {
    this.appRouter.navigateToWorkflowTemplateView(this.namespace, this.sourceWorkflowTemplateUid);
  }

  setServerError(message: Alert) {
    setTimeout( () => {
      this.serverError = null;
    });
  }

  getSourceWorkflowTemplate(uid: string) {
    this.workflowTemplateService.getWorkflowTemplate(this.namespace, uid)
        .subscribe(res => {
          this.templateNameInput.setValue(res.name + '-clone');
          this.manifestText = res.manifest;
          this.manifestTextCurrent = res.manifest;
        })
  }

  getSourceWorkflowLabels(uid: string) {
    this.workflowServiceService.getWorkflowTemplateLabels(this.namespace, uid)
        .subscribe(res => {
          if(!res.labels) {
            return;
          }

          this.labels = res.labels;
        })
  }
}
