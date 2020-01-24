import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { WorkflowTemplateBase, WorkflowTemplateDetail, WorkflowTemplateService } from '../workflow-template.service';
import { DagComponent } from '../../dag/dag.component';
import { NodeRenderer } from '../../node/node.service';
import { CreateWorkflow, Workflow, WorkflowService } from '../../workflow/workflow.service';
import { MatTabChangeEvent } from '@angular/material';

@Component({
  selector: 'app-workflow-template-view',
  templateUrl: './workflow-template-view.component.html',
  styleUrls: ['./workflow-template-view.component.scss'],
  providers: [WorkflowService, WorkflowTemplateService]
})
export class WorkflowTemplateViewComponent implements OnInit {
  private dagComponent: DagComponent;
  @ViewChild(DagComponent, {static: false}) set dag(value: DagComponent) {
    this.dagComponent = value;
    this.showDag();
  }
  get dag(): DagComponent {
    return this.dagComponent;
  }

  manifestText: string;
  yamlError: string|null = null;

  namespace: string;
  uid: string;

  workflows: Workflow[] = [];

  private workflowTemplateDetail: WorkflowTemplateDetail;

  get workflowTemplate(): WorkflowTemplateDetail {
    return this.workflowTemplateDetail;
  }

  set workflowTemplate(value: WorkflowTemplateDetail) {
    this.workflowTemplateDetail = value;
    this.manifestText = value.manifest;
    this.showDag();
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
      });

    this.getWorkflows(value);
  }

  get selectedWorkflowTemplateVersionValue(): number {
    return this._selectedWorkflowTemplateVersionValue;
  }

  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private workflowService: WorkflowService,
    private workflowTemplateService: WorkflowTemplateService) { }

  ngOnInit() {
    this.activatedRoute.paramMap.subscribe(next => {
      this.namespace = next.get('namespace');
      this.uid = next.get('uid');

      this.getWorkflowTemplate();
      this.getWorkflowTemplateVersions();
    });
  }

  getWorkflowTemplate() {
    this.workflowTemplateService.getWorkflowTemplate(this.namespace, this.uid)
      .subscribe(res => {
        console.log('Got workflow template');
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
          if (version.version > newestVersion.version) {
            newestVersion = version;
          }
        }

        this.selectedWorkflowTemplateVersionValue = newestVersion.version;
      });
  }

  getWorkflows(version: number) {
    this.workflowService.listWorkflows(this.namespace, this.uid, version)
      .subscribe(res => {
        this.workflows = res.workflows;
      });
  }

  executeWorkflow() {

    // TODO - on save update the template so the execution here is the latest

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

  showDag() {
    if (!this.dag) {
      return;
    }

    const g = NodeRenderer.createGraphFromManifest(this.workflowTemplateDetail.manifest);
    this.dag.display(g);
  }

  onTabChange(event: MatTabChangeEvent) {
    if (event.index === 1) {
      this.showDag();
    }
  }
}
