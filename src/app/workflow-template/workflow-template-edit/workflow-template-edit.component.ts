import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DagComponent } from '../../dag/dag.component';
import { NodeRenderer } from '../../node/node.service';
import { WorkflowService } from '../../workflow/workflow.service';
import { HttpErrorResponse } from "@angular/common/http";
import { AceEditorComponent } from "ng2-ace-editor";
import * as yaml from 'js-yaml';
import * as ace from 'brace';
import { Alert } from "../../alert/alert";
import { KeyValue, WorkflowServiceService, WorkflowTemplate, WorkflowTemplateServiceService } from "../../../api";
import { LabelsEditComponent } from "../../labels/labels-edit/labels-edit.component";
import {
    WorkflowTemplateSelected,
    WorkflowTemplateSelectHeader,
    WorkflowTemplateSelectItem
} from "../../workflow-template-select/workflow-template-select.component";
import { AppRouter } from "../../router/app-router.service";
const aceRange = ace.acequire('ace/range').Range;

@Component({
  selector: 'app-workflow-template-edit',
  templateUrl: './workflow-template-edit.component.html',
  styleUrls: ['./workflow-template-edit.component.scss'],
})
export class WorkflowTemplateEditComponent implements OnInit {
  @ViewChild(DagComponent, {static: false}) dag: DagComponent;
  @ViewChild(AceEditorComponent, {static: false}) aceEditor: AceEditorComponent;
  @ViewChild(LabelsEditComponent, {static: false}) labelEditor: LabelsEditComponent;

  manifestText: string;
  manifestTextCurrent: string;
  serverError: Alert;

  namespace: string;
  uid: string;

  errorMarkerId;


  _workflowTemplate: WorkflowTemplate;
  labels = new Array<KeyValue>();
  workflowTemplateVersions: WorkflowTemplate[] = [];
  selectedWorkflowTemplateVersion: number;

  // This is what we display in the side menu
  workflowTemplateListItems = new Array<WorkflowTemplateSelectItem>();

  get workflowTemplate(): WorkflowTemplate {
    return this._workflowTemplate;
  }

  set workflowTemplate(value: WorkflowTemplate) {
    if (!this.dag) {
      setTimeout( () => this.workflowTemplate = value, 500);
      return;
    }

    this._workflowTemplate = value;
    const g = NodeRenderer.createGraphFromManifest(value.manifest);
    this.dag.display(g);

    this.manifestText = value.manifest;
    this.manifestTextCurrent = value.manifest;
  }

  constructor(
    private appRouter: AppRouter,
    private activatedRoute: ActivatedRoute,
    private workflowTemplateService: WorkflowTemplateServiceService,
    private workflowService: WorkflowServiceService) { }

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

  onManifestChange(newManifest: string) {
    this.manifestTextCurrent = newManifest;

    if(newManifest === '') {
      this.dag.clear();
      return;
    }

    if(this.errorMarkerId) {
      this.aceEditor.getEditor().session.removeMarker(this.errorMarkerId)
    }

    try {
      const g = NodeRenderer.createGraphFromManifest(newManifest);
      this.dag.display(g);
      setTimeout( () => {
         this.serverError = null;
      });
    }
    catch (e) {
      if(e instanceof yaml.YAMLException) {
          const line = e.mark.line + 1;
          const column = e.mark.column + 1;

          const codeErrorRange = new aceRange(line - 1, 0, line - 1, column);
          this.errorMarkerId = this.aceEditor.getEditor().session.addMarker(codeErrorRange, "highlight-error", "fullLine");

          this.serverError = {
              message: e.reason + " at line: " + line + " column: " + column,
              type: 'danger'
          };
      }
    }
  }

  getWorkflowTemplateVersions() {
    this.workflowTemplateService.listWorkflowTemplateVersions(this.namespace, this.uid)
      .subscribe(res => {
        this.workflowTemplateVersions = res.workflowTemplates.sort((a, b) => {
            return b.version - a.version;
        })

        if (this.workflowTemplateVersions.length === 0) {
          return;
        }

        let header: WorkflowTemplateSelectHeader = {
            title: 'Versions',
            image: '/assets/images/workflows-blank-icon.svg'
        }

        let children = new Array<WorkflowTemplateSelected>();
        for(const version of this.workflowTemplateVersions) {
            let newItem: WorkflowTemplateSelected = {
                name: version.version.toString(),
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
    // @todo display error message if duplicates.
    if(!this.labelEditor.isValid) {
        this.labelEditor.markAllAsDirty();
        return;
    }

    // TODO @todo update clone - but clone doesn't have versions?
    this.workflowTemplateService
      .createWorkflowTemplateVersion(
        this.namespace,
        this.workflowTemplate.uid,
        {
          name: this.workflowTemplate.name,
          manifest: this.manifestTextCurrent,
          labels: this.labels,
        })
      .subscribe(res => {
          this.appRouter.navigateToWorkflowTemplateView(this.namespace, this.workflowTemplate.uid);
      }, (err: HttpErrorResponse) => {
        this.serverError = {
          message: err.error.message,
          type: 'danger',
        };
      });
  }

  cancel() {
    this.appRouter.navigateToWorkflowTemplateView(this.namespace, this.workflowTemplate.uid);
  }

  getLabels() {
    this.workflowTemplateService.getWorkflowTemplateLabels(this.namespace, this.uid)
        .subscribe(res => {
            if(!res.labels) {
                return;
            }

            this.labels = res.labels;
        })
  }

  onVersionSelected(selected: WorkflowTemplateSelected) {
      this.manifestText = selected.manifest;
      this.manifestTextCurrent = selected.manifest;
  }
}
