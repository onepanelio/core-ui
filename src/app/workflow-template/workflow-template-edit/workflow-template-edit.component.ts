import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { WorkflowTemplateBase, WorkflowTemplateDetail, WorkflowTemplateService } from '../workflow-template.service';
import { DagComponent } from '../../dag/dag.component';
import { NodeRenderer } from '../../node/node.service';
import { WorkflowService } from '../../workflow/workflow.service';
import { HttpErrorResponse } from "@angular/common/http";
import { AceEditorComponent } from "ng2-ace-editor";
import * as yaml from 'js-yaml';
import * as ace from 'brace';
import { Alert } from "../../alert/alert";
import { KeyValue, WorkflowServiceService } from "../../../api";
import { LabelsEditComponent } from "../../labels/labels-edit/labels-edit.component";
const aceRange = ace.acequire('ace/range').Range;

@Component({
  selector: 'app-workflow-template-edit',
  templateUrl: './workflow-template-edit.component.html',
  styleUrls: ['./workflow-template-edit.component.scss'],
  providers: [WorkflowService, WorkflowTemplateService]
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

  workflowTemplateDetail: WorkflowTemplateDetail;
  errorMarkerId;

  labels = new Array<KeyValue>();

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

  workflowTemplateVersions: WorkflowTemplateBase[] = [];
  workflowTemplateVersionsMap = new Map<number, WorkflowTemplateBase>();

  private _selectedWorkflowTemplateVersionValue: number;
  set selectedWorkflowTemplateVersionValue(value: number) {
    this._selectedWorkflowTemplateVersionValue = value;
    const selectedVersion = this.workflowTemplateVersionsMap.get(value);

    this.workflowTemplateService.getWorkflowTemplateForVersion(this.namespace, selectedVersion.uid, selectedVersion.version)
      .subscribe(res => {
        this.workflowTemplate = res;

        if (!res.isLatest) {
          // this.router.navigate(['/', this.namespace, 'workflow-templates', res.uid]);
        }
      });
  }

  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private workflowService: WorkflowService,
    private workflowTemplateService: WorkflowTemplateService,
    private workflowServiceService: WorkflowServiceService) { }

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
        this.workflowTemplateVersions = res.workflowTemplates;

        if (this.workflowTemplateVersions.length === 0) {
          return;
        }

        // Set the latest version
        let newestVersion = this.workflowTemplateVersions[0];
        for (const version of this.workflowTemplateVersions) {
          this.workflowTemplateVersionsMap.set(version.version, version);

          if (version.isLatest) {
            newestVersion = version;
          }
        }

        this.selectedWorkflowTemplateVersionValue = newestVersion.version;
      });
  }

  update() {
    // @todo display error message if duplicates.
    if(!this.labelEditor.isValid) {
        this.labelEditor.markAllAsDirty();
        return;
    }

    this.workflowTemplateService
      .createWorkflowTemplateVersion(
        this.namespace,
        this.workflowTemplateDetail.uid,
        {
          name: this.workflowTemplateDetail.name,
          manifest: this.manifestTextCurrent,
        })
      .subscribe(res => {
        this.workflowServiceService.replaceWorkflowTemplateLabels(this.namespace, this.workflowTemplateDetail.uid, {
            items: this.labels
        }).subscribe( labelRes => {
            // Do nothing
        }, err => {
            // Do nothing
        }, () => {
            this.router.navigate(['/', this.namespace, 'workflow-templates', this.workflowTemplateDetail.uid]);
        })
      }, (err: HttpErrorResponse) => {
        this.serverError = {
          message: err.error.message,
          type: 'danger',
        };
      });
  }

  cancel() {
    this.router.navigate(['/', this.namespace, 'workflow-templates', this.workflowTemplateDetail.uid]);
  }

  getLabels() {
    this.workflowServiceService.getWorkflowTemplateLabels(this.namespace, this.uid)
        .subscribe(res => {
            if(!res.labels) {
                return;
            }

            this.labels = res.labels;
        })
  }
}
