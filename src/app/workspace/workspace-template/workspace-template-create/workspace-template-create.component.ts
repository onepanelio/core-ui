import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, Validators } from "@angular/forms";
import { KeyValue, WorkspaceTemplate, WorkspaceTemplateServiceService } from "../../../../api";
import { ActivatedRoute } from "@angular/router";
import { map } from "rxjs/operators";
import { LabelsEditComponent } from "../../../labels/labels-edit/labels-edit.component";
import { ManifestDagEditorComponent } from "../../../manifest-dag-editor/manifest-dag-editor.component";
import { Alert } from "../../../alert/alert";

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

  @Input() loading = false;

  namespace: string;

  private defaultManifest = `# Docker containers that are part of the Workspace
containers:
- name: http
  image: nginxdemos/hello
  ports:
  - containerPort: 80
    name: http
  # Volumes to be mounted in this container
  # Onepanel will automatically create these volumes and mount them to the container
  volumeMounts:
  - name: data
    mountPath: /data
# Ports that need to be exposed
ports:
- name: http
  port: 80
  protocol: TCP
  targetPort: 80
# Routes that will map to ports
routes:
- match:
  - uri:
      prefix: /
  route:
  - destination:
      port:
        number: 80
# DAG Workflow to be executed once a Workspace action completes
postExecutionWorkflow:
  entrypoint: main
  templates:
  - name: main
    dag:
       tasks:
       - name: slack-notify
         template: slack-notify
  -  name: slack-notify
     container:
       image: technosophos/slack-notify
       args:
       - SLACK_USERNAME=onepanel SLACK_TITLE="Your workspace is ready" SLACK_ICON=https://www.gravatar.com/avatar/5c4478592fe00878f62f0027be59c1bd SLACK_MESSAGE="Your workspace is now running" ./slack-notify
       command:
       - sh
       - -c`;

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

  private setDefaultManifest() {
    if(!this.manifestDagEditor) {
      setTimeout(() => {
        this.setDefaultManifest();
      }, 100)
    } else {
      this.manifest = this.defaultManifest;
      this.manifestDagEditor.onManifestChange(this.defaultManifest);
    }
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

    this.setDefaultManifest();
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

  setAlert(alert: Alert) {
    this.manifestDagEditor.notification = alert;
  }
}
