import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpErrorResponse } from "@angular/common/http";
import { LabelsEditComponent } from "../../labels/labels-edit/labels-edit.component";
import {
    WorkflowTemplateSelected,
    WorkflowTemplateSelectHeader,
    WorkflowTemplateSelectItem
} from "../../workflow-template-select/workflow-template-select.component";
import { AppRouter } from "../../router/app-router.service";
import {
    KeyValue,
    LabelServiceService,
    WorkflowTemplate,
    WorkflowTemplateServiceService
} from "../../../api";
import { ManifestDagEditorComponent } from "../../manifest-dag-editor/manifest-dag-editor.component";
import { DatePipe } from "@angular/common";
import { CanComponentDeactivate } from "../../guards/can-deactivate.guard";
import { Observable } from "rxjs";
import {
    ConfirmationDialogComponent,
    ConfirmationDialogData
} from "../../confirmation-dialog/confirmation-dialog.component";
import { MatDialog, MatDialogRef } from "@angular/material/dialog";

@Component({
  selector: 'app-workflow-template-edit',
  templateUrl: './workflow-template-edit.component.html',
  styleUrls: ['./workflow-template-edit.component.scss'],
  providers: [DatePipe]
})
export class WorkflowTemplateEditComponent implements OnInit, CanComponentDeactivate {
  @ViewChild(ManifestDagEditorComponent, {static: false}) manifestDagEditor: ManifestDagEditorComponent;
  @ViewChild(LabelsEditComponent, {static: false}) labelEditor: LabelsEditComponent;

  manifestText: string;
  namespace: string;
  uid: string;

  _workflowTemplate: WorkflowTemplate;
  labels = new Array<KeyValue>();
  workflowTemplateVersions: WorkflowTemplate[] = [];
  selectedWorkflowTemplateVersion: string;

  // This is what we display in the side menu
  workflowTemplateListItems = new Array<WorkflowTemplateSelectItem>();

  /**
   * manifestChanged keeps track if any changes have been made since the editor was opened.
   */
  manifestChanged = false;

  get workflowTemplate(): WorkflowTemplate {
    return this._workflowTemplate;
  }

  set workflowTemplate(value: WorkflowTemplate) {
    this._workflowTemplate = value;
    this.manifestText = value.manifest;
  }

  constructor(
    private appRouter: AppRouter,
    private activatedRoute: ActivatedRoute,
    private workflowTemplateService: WorkflowTemplateServiceService,
    private labelService: LabelServiceService,
    private datePipe: DatePipe,
    private dialogRef: MatDialog) {
  }

  ngOnInit() {
    this.activatedRoute.paramMap.subscribe(next => {
      this.namespace = next.get('namespace');
      this.uid = next.get('uid');

      this.getWorkflowTemplate();
      this.getWorkflowTemplateVersions();
    });
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

  getWorkflowTemplate() {
    this.workflowTemplateService.getWorkflowTemplate(this.namespace, this.uid)
      .subscribe(res => {
        this.workflowTemplate = res;
        this.selectedWorkflowTemplateVersion = res.version;
        this.labels = res.labels || [];
      });
  }

  getWorkflowTemplateVersions() {
    this.workflowTemplateService.listWorkflowTemplateVersions(this.namespace, this.uid)
      .subscribe(res => {
        this.workflowTemplateVersions = res.workflowTemplates;
        if (this.workflowTemplateVersions.length === 0) {
          return;
        }

        let header: WorkflowTemplateSelectHeader = {
            title: 'Versions',
            image: '/assets/images/workflows-blank-icon.svg'
        }

        let children = new Array<WorkflowTemplateSelected>();

        for(const version of this.workflowTemplateVersions) {
            const dateValue = this.datePipe.transform(version.createdAt, 'MMM d, y h:mm:ss a')
            let newItem: WorkflowTemplateSelected = {
                name: `${dateValue}`,
                manifest: version.manifest
            };

            children.push(newItem);
        }

        this.workflowTemplateListItems = [{
            header: header,
            children: children
        }];

      });
  }

  update() {
    if(!this.labelEditor.isValid) {
        this.labelEditor.markAllAsDirty();
        return;
    }

    const manifestText = this.manifestDagEditor.manifestTextCurrent;

    this.workflowTemplateService
      .createWorkflowTemplateVersion(
        this.namespace,
        this.workflowTemplate.uid,
        {
          name: this.workflowTemplate.name,
          manifest: manifestText,
          labels: this.labels,
        })
      .subscribe(res => {
          this.appRouter.navigateToWorkflowTemplateView(this.namespace, this.workflowTemplate.uid);
      }, (err: HttpErrorResponse) => {
        this.manifestDagEditor.error = {
            message: err.error.message,
            type: 'danger',
        };
      });
  }

  cancel() {
    this.appRouter.navigateToWorkflowTemplateView(this.namespace, this.workflowTemplate.uid);
  }

  getLabels(version: string|null = null) {
      const templateVersion = this.workflowTemplateVersions.find(wft => wft.version === version);
      if(!templateVersion) {
          return;
      }

      this.labelService.getLabels(this.namespace, 'workflow_template_version', templateVersion.uid)
        .subscribe(res => {
            if(!res.labels) {
                this.labels = [];
                return;
            }

            this.labels = res.labels;
        })
  }

  onVersionSelected(selected: string) {
      const version = this.workflowTemplateVersions.find(wft => wft.version === selected);
      if(!version) {
          return;
      }

      this.manifestText = version.manifest;
      this.getLabels(version.version);
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
