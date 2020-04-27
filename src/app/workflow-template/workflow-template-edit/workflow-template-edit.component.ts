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
import { KeyValue, WorkflowServiceService, WorkflowTemplate, WorkflowTemplateServiceService } from "../../../api";
import { ManifestDagEditorComponent } from "../../manifest-dag-editor/manifest-dag-editor.component";
import { DatePipe } from "@angular/common";

@Component({
  selector: 'app-workflow-template-edit',
  templateUrl: './workflow-template-edit.component.html',
  styleUrls: ['./workflow-template-edit.component.scss'],
  providers: [DatePipe]
})
export class WorkflowTemplateEditComponent implements OnInit {
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
    private datePipe: DatePipe) {

  }

  ngOnInit() {
    this.activatedRoute.paramMap.subscribe(next => {
      this.namespace = next.get('namespace');
      this.uid = next.get('uid');

      this.getWorkflowTemplate();
      this.getWorkflowTemplateVersions();
      this.getLabels();
    });
  }

  getWorkflowTemplate() {
    this.workflowTemplateService.getWorkflowTemplate(this.namespace, this.uid)
      .subscribe(res => {
        this.workflowTemplate = res;
        this.selectedWorkflowTemplateVersion = res.version;
      });
  }

  getWorkflowTemplateVersions() {
    this.workflowTemplateService.listWorkflowTemplateVersions(this.namespace, this.uid)
      .subscribe(res => {
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
    // @todo display error message if there are duplicates in the labels.
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
        this.manifestDagEditor.serverError = {
            message: err.error.message,
            type: 'danger',
        };
      });
  }

  cancel() {
    this.appRouter.navigateToWorkflowTemplateView(this.namespace, this.workflowTemplate.uid);
  }

  getLabels(version: string|null = null) {
    this.workflowTemplateService.getWorkflowTemplateLabels(this.namespace, this.uid, version)
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
}
