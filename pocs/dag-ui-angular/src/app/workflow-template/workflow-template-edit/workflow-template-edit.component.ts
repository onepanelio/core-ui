import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { WorkflowTemplateBase, WorkflowTemplateDetail, WorkflowTemplateService } from '../workflow-template.service';
import { DagComponent } from '../../dag/dag.component';
import { NodeRenderer } from '../../node/node.service';
import { CreateWorkflow, WorkflowService } from '../../workflow/workflow.service';
import { MatSnackBar } from '@angular/material';

@Component({
  selector: 'app-workflow-template-edit',
  templateUrl: './workflow-template-edit.component.html',
  styleUrls: ['./workflow-template-edit.component.scss'],
  providers: [WorkflowService, WorkflowTemplateService]
})
export class WorkflowTemplateEditComponent implements OnInit {
  @ViewChild(DagComponent, {static: false}) dag: DagComponent;

  manifestText: string;
  manifestTextCurrent: string;
  yamlError: string|null = null;

  namespace: string;
  uid: string;

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
          this.router.navigate(['/', this.namespace, 'workflow-templates', res.uid]);
        }
      });
  }

  get selectedWorkflowTemplateVersionValue(): number {
    return this._selectedWorkflowTemplateVersionValue;
  }

  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private workflowService: WorkflowService,
    private workflowTemplateService: WorkflowTemplateService,
    private snackBar: MatSnackBar) { }

  ngOnInit() {
    this.activatedRoute.paramMap.subscribe(next => {
      this.namespace = next.get('namespace');
      this.uid = next.get('uid');

      this.getWorkflowTemplate();
      this.getWorkflowTemplateVersions();
      this.getWorkflows();
    });
  }

  getWorkflowTemplate() {
    this.workflowTemplateService.getWorkflowTemplate(this.namespace, this.uid)
      .subscribe(res => {
        this.workflowTemplate = res;
      });
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

  getWorkflows() {
    this.workflowService.listWorkflows(this.namespace, this.uid)
      .subscribe(res => {
      });
  }

  onManifestChange(newManifest: string) {
    this.yamlError = null;

    this.manifestTextCurrent = newManifest;

    try {
      const g = NodeRenderer.createGraphFromManifest(newManifest);
      this.dag.display(g);
    } catch (e) {
      this.yamlError = 'error';
    }
  }

  executeWorkflow() {
    const request: CreateWorkflow = {
      namespace: this.namespace,
      workflowTemplate: this.workflowTemplate,
    };

    this.workflowService.executeWorkflow(this.namespace, request)
      .subscribe(res => {
        console.log(res);
        this.router.navigate(['/', this.namespace, 'workflows', res.name]);
      }, err => {

      });
    // on success navigate to new workflow page
  }

  update() {
    if (this.yamlError !== null) {
      this.snackBar.open('Unable to update - the definition is not valid YAML', 'OK');
      return;
    }

    this.workflowTemplateService
      .updateWorkflowTemplateForVersion(
        this.namespace,
        this.workflowTemplateDetail.uid,
        this.workflowTemplateDetail.version,
        {
          manifest: this.manifestTextCurrent,
        })
      .subscribe(res => {
        this.snackBar.open('Update successful', 'OK', {
          duration: 2000
        });
      });
  }

  updateAndPublish() {
    if (this.yamlError !== null) {
      this.snackBar.open('Unable to update - the definition is not valid YAML', 'OK');
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
        this.getWorkflowTemplateVersions();

        this.snackBar.open('Update successful', 'OK', {
          duration: 2000
        });
      });
  }
}
