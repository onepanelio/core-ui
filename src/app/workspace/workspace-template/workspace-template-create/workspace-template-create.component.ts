import { Component, EventEmitter, OnInit, Output, ViewChild } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, Validators } from "@angular/forms";
import { KeyValue, WorkspaceTemplate, WorkspaceTemplateServiceService } from "../../../../api";
import { ActivatedRoute } from "@angular/router";
import { map } from "rxjs/operators";
import { LabelsEditComponent } from "../../../labels/labels-edit/labels-edit.component";
import { ManifestDagEditorComponent } from "../../../manifest-dag-editor/manifest-dag-editor.component";

@Component({
  selector: 'app-workspace-template-create',
  templateUrl: './workspace-template-create.component.html',
  styleUrls: ['./workspace-template-create.component.scss']
})
export class WorkspaceTemplateCreateComponent implements OnInit {
  @ViewChild(ManifestDagEditorComponent, {static: false}) manifestDagEditor: ManifestDagEditorComponent;
  @ViewChild(LabelsEditComponent, {static: false}) labelEditor: LabelsEditComponent;

  @Output() cancelEmitted = new EventEmitter();
  @Output() saveEmitted = new EventEmitter<WorkspaceTemplate>();

  namespace: string;
  manifest = "";
  templateNameInput: AbstractControl;
  form: FormGroup;
  labels = new Array<KeyValue>();
  apiManifestInterceptor = undefined;

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
      ]});

    this.templateNameInput = this.form.get('templateNameInput');

    this.activatedRoute.paramMap.subscribe(next => {
      this.namespace = next.get('namespace');
    });
  }

  ngOnInit() {
    this.apiManifestInterceptor = (newManifest: string) => {
      const body = {
        manifest: newManifest,
      }
      return this.workspaceTemplateService.generateWorkspaceTemplateWorkflowTemplate(this.namespace, 'generated', body)
          .pipe(
            map(res => res.manifest)
          );
    }
  }

  cancel() {
    this.cancelEmitted.emit();
  }

  save() {
    const templateName = this.templateNameInput.value;

    if(!templateName) {
      return;
    }

    if(!this.labelEditor.isValid) {
      this.labelEditor.markAllAsDirty();
      return;
    }

    const body: WorkspaceTemplate = {
      name: templateName,
      manifest: this.manifestDagEditor.rawManifest,
      labels: this.labels,
    };

    this.saveEmitted.emit(body);
  }
}
