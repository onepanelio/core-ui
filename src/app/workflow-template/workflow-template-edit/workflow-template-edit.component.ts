import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { LabelsEditComponent } from '../../labels/labels-edit/labels-edit.component';
import {
    WorkflowTemplateSelected,
    WorkflowTemplateSelectHeader,
    WorkflowTemplateSelectItem
} from '../../workflow-template-select/workflow-template-select.component';
import { AppRouter } from '../../router/app-router.service';
import {
    KeyValue,
    LabelServiceService,
    WorkflowTemplate,
    WorkflowTemplateServiceService
} from '../../../api';
import { ManifestDagEditorComponent } from '../../manifest-dag-editor/manifest-dag-editor.component';
import { DatePipe } from '@angular/common';
import { CanComponentDeactivate } from '../../guards/can-deactivate.guard';
import { Observable } from 'rxjs';
import {
    ConfirmationDialogComponent,
    ConfirmationDialogData
} from '../../confirmation-dialog/confirmation-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { map } from 'rxjs/operators';

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

    // tslint:disable-next-line:variable-name
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

  /**
   * saving is true if the editor is currently saving the data and false otherwise.
   */
  saving = false;

  /**
   * loading keeps track of all of the components that are currently loading
   */
  loading = {
      workflowTemplate: true,
      workflowTemplateVersions: true
  };

  apiManifestInterceptor = (manifest: string) => {
      const body = { manifest };
      return this.workflowTemplateService.generateWorkflowTemplate(this.namespace, 'generated', body)
          .pipe(
              map(res => res.manifest)
          );
  }

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
      if (!this.manifestChanged) {
          return true;
      }

      const confirmData: ConfirmationDialogData = {
          title: 'You have unsaved changes',
          message: 'You have unsaved changes in your template, leaving will discard them.',
          confirmText: 'DISCARD CHANGES',
          type: 'confirm'
      };

      const confirmDialog = this.dialogRef.open(ConfirmationDialogComponent, {
          data: confirmData
      });

      return confirmDialog.afterClosed();
  }

  getWorkflowTemplate() {
    this.loading.workflowTemplate = true;

    this.workflowTemplateService.getWorkflowTemplate(this.namespace, this.uid)
      .subscribe(res => {
        this.workflowTemplate = res;
        this.selectedWorkflowTemplateVersion = res.version;
        this.labels = res.labels || [];
        this.loading.workflowTemplate = false;
      }, err => {
        this.loading.workflowTemplate = false;
    });
  }

  getWorkflowTemplateVersions() {
    this.loading.workflowTemplateVersions = true;
    this.workflowTemplateService.listWorkflowTemplateVersions(this.namespace, this.uid)
      .subscribe(res => {
        this.workflowTemplateVersions = res.workflowTemplates;
        if (this.workflowTemplateVersions.length === 0) {
          return;
        }

        const header: WorkflowTemplateSelectHeader = {
            title: 'Versions',
            image: '/assets/images/workflows-blank-icon.svg'
        };

        const children = new Array<WorkflowTemplateSelected>();

        for (const version of this.workflowTemplateVersions) {
            const dateValue = this.datePipe.transform(version.createdAt, 'MMM d, y h:mm:ss a');
            const newItem: WorkflowTemplateSelected = {
                name: `${dateValue}`,
                manifest: version.manifest,
                labels: version.labels,
            };

            children.push(newItem);
        }

        this.workflowTemplateListItems = [{
            header,
            children
        }];

        this.loading.workflowTemplateVersions = false;
      }, err => {
          this.loading.workflowTemplateVersions = false;
      });
  }

  update() {
    this.manifestChanged = false;

    if (!this.labelEditor.isValid) {
        this.labelEditor.markAllAsDirty();
        return;
    }

    const manifestText = this.manifestDagEditor.manifestTextCurrent;

    this.saving = true;

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
          this.saving = false;
      }, (err: HttpErrorResponse) => {
        this.manifestDagEditor.error = {
            message: err.error.message,
            type: 'danger',
        };

        this.saving = false;
      });
  }

  cancel() {
    this.appRouter.navigateToWorkflowTemplateView(this.namespace, this.workflowTemplate.uid);
  }

  onVersionSelected(selected: string) {
      const version = this.workflowTemplateVersions.find(wft => wft.version === selected);
      if (!version) {
          return;
      }

      this.manifestText = version.manifest;
      if (version.labels) {
          this.labels = version.labels;
      } else {
          this.labels = [];
      }
  }

  onManifestTextModified(manifest: string) {
      // No need to update the change status again
      if (this.manifestChanged) {
          return;
      }

      if (manifest === this.manifestText) {
          this.manifestChanged = false;
          return;
      }

      this.manifestChanged = true;
  }
}
