import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { KeyValue, WorkflowTemplate, WorkspaceTemplate, WorkspaceTemplateServiceService } from '../../../../api';
import { ActivatedRoute } from '@angular/router';
import { map } from 'rxjs/operators';
import { LabelsEditComponent } from '../../../labels/labels-edit/labels-edit.component';
import { ManifestDagEditorComponent } from '../../../manifest-dag-editor/manifest-dag-editor.component';
import { Alert } from '../../../alert/alert';

@Component({
  selector: 'app-workspace-template-edit',
  templateUrl: './workspace-template-edit.component.html',
  styleUrls: ['./workspace-template-edit.component.scss']
})
export class WorkspaceTemplateEditComponent implements OnInit {
  @ViewChild(ManifestDagEditorComponent, {static: false}) manifestDagEditor: ManifestDagEditorComponent;
  @ViewChild(LabelsEditComponent, {static: false}) labelEditor: LabelsEditComponent;

  @Input() namespace: string;
  @Input() showUpdate = true;

  // tslint:disable-next-line:variable-name
  private _workspaceTemplate: WorkspaceTemplate;
  @Input() set workspaceTemplate(value: WorkspaceTemplate) {
    if (!value) {
      return;
    }

    if (value && this._workspaceTemplate && value.name === this._workspaceTemplate.name) {
      return;
    }

    this._workspaceTemplate = value;
    this.getWorkspaceTemplateVersions();
  }

  get workspaceTemplate(): WorkspaceTemplate {
    return this._workspaceTemplate;
  }

  @Output() cancelEmitted = new EventEmitter();
  @Output() saveEmitted = new EventEmitter<WorkspaceTemplate>();

  manifest = '';
  form: FormGroup;
  labels = new Array<KeyValue>();
  apiManifestInterceptor = undefined;
  templateDescriptionInput: AbstractControl;

  selectedWorkspaceTemplateVersion = '';
  workspaceTemplateVersions: WorkflowTemplate[] = [];

  @Input() loading = false;

  /**
   * manifestChangedSinceSave keeps track if any changes have been made since save was emitted.
   * It starts as false since the default template is not important and does not contain any custom user changes.
   */
  manifestChangedSinceSave = false;

  constructor(
      private formBuilder: FormBuilder,
      private activatedRoute: ActivatedRoute,
      private workspaceTemplateService: WorkspaceTemplateServiceService,
  ) {
    this.form = this.formBuilder.group({
      templateNameInput: [
        '',
        Validators.compose([
          Validators.required,
        ]),
      ],
    templateDescriptionInput: ['']});

    this.templateDescriptionInput = this.form.get('templateDescriptionInput');
  }

  ngOnInit() {
    this.apiManifestInterceptor = (newManifest: string) => {
      const body = {
        manifest: newManifest,
      };
      return this.workspaceTemplateService.generateWorkspaceTemplateWorkflowTemplate(this.namespace, 'generated', body)
          .pipe(
              map(res => res.manifest)
          );
    };
  }

  getWorkspaceTemplateVersions() {
    this.workspaceTemplateService.listWorkspaceTemplateVersions(this.namespace, this.workspaceTemplate.uid)
        .subscribe(res => {
          if (res.workspaceTemplates && res.workspaceTemplates.length > 0) {
            this.selectedWorkspaceTemplateVersion = res.workspaceTemplates[0].version;

            const labels = res.workspaceTemplates[0].labels;
            if (labels) {
              this.labels = labels;
            } else {
              this.labels = [];
            }

            this.manifestChangedSinceSave = false;
            this.workspaceTemplateVersions = res.workspaceTemplates;
            this.manifest = res.workspaceTemplates[0].manifest;
            this.manifestDagEditor.onManifestChange(this.manifest);
          }
        });
  }

  cancel() {
    this.cancelEmitted.emit();
  }

  save() {
    if (!this.labelEditor.isValid) {
      this.labelEditor.markAllAsDirty();
      return;
    }

    const body: WorkspaceTemplate = {
      uid: this.workspaceTemplate.uid,
      name: this.workspaceTemplate.name,
      description: this.templateDescriptionInput.value,
      manifest: this.manifestDagEditor.rawManifest,
      labels: this.labels,
    };

    this.saveEmitted.emit(body);
    this.manifestChangedSinceSave = false;
  }

  onVersionSelected(version: string) {
    const workspaceTemplateVersion = this.workspaceTemplateVersions.find((value => {
      return value.version === version;
    }));

    if (!workspaceTemplateVersion) {
      return;
    }

    this.selectedWorkspaceTemplateVersion = version;
    this.labels = workspaceTemplateVersion.labels;
    this.manifest = workspaceTemplateVersion.manifest;
  }

  setAlert(alert: Alert) {
    this.manifestDagEditor.notification = alert;
  }

  onManifestTextModified(manifest: string) {
    // No need to update it again.
    if (this.manifestChangedSinceSave) {
      return;
    }

    if (manifest === this.manifest) {
      this.manifestChangedSinceSave = false;
      return;
    }

    this.manifestChangedSinceSave = true;
  }
}
