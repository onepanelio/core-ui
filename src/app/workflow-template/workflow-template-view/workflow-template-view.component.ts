import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { WorkflowTemplateBase, WorkflowTemplateDetail, WorkflowTemplateService } from '../workflow-template.service';
import { DagComponent } from '../../dag/dag.component';
import { NodeRenderer } from '../../node/node.service';
import {
  CreateWorkflow,
  ListWorkflowRequest,
  Workflow,
  WorkflowResponse,
  WorkflowService
} from '../../workflow/workflow.service';
import { MatTabChangeEvent } from '@angular/material';
import { MatSnackBar } from "@angular/material/snack-bar";
import { MatDialog } from "@angular/material/dialog";
import { WorkflowExecuteDialogComponent } from "../../workflow/workflow-execute-dialog/workflow-execute-dialog.component";
import { PageEvent } from "@angular/material/paginator";
import { ConfirmationDialogComponent } from "../../confirmation-dialog/confirmation-dialog.component";
import { AlertService } from "../../alert/alert.service";
import { Alert } from "../../alert/alert";

export class Pagination {
  page: number = 0;
  pageSize: number = 15;
}

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
  namespace: string;
  uid: string;

  workflows: Workflow[] = [];
  workflowResponse: WorkflowResponse;
  workflowPagination = new Pagination();
  hasWorkflowExecutions = false;

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

    this.getWorkflows();
  }

  get selectedWorkflowTemplateVersionValue(): number {
    return this._selectedWorkflowTemplateVersionValue;
  }

  constructor(
    private snackBar: MatSnackBar,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private workflowService: WorkflowService,
    private workflowTemplateService: WorkflowTemplateService,
    private dialog: MatDialog,
    private alertService: AlertService
  ) { }

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
          if (version.version > newestVersion.version) {
            newestVersion = version;
          }
        }

        this.selectedWorkflowTemplateVersionValue = newestVersion.version;
      });
  }

  getWorkflows() {
    const request: ListWorkflowRequest = {
      namespace: this.namespace,
      workflowTemplateUid: this.uid,
      pageSize: this.workflowPagination.pageSize,
      page: this.workflowPagination.page + 1, // Tab is 0 based, so we add 1, since API is 1 based.
    };

    this.workflowService.listWorkflows(request)
      .subscribe(res => {
        this.workflowResponse = res;
        this.workflows = res.workflowExecutions;

        this.hasWorkflowExecutions = !(request.page === 1 && !res.workflowExecutions);
      });
  }

  executeWorkflow(e: any) {
    if(e) {
      e.preventDefault();
    }

    const dialogRef = this.dialog.open(WorkflowExecuteDialogComponent, {
      width: '60vw',
      data: {manifest: this.manifestText}
    });

    dialogRef.afterClosed().subscribe(result => {
      if (!result) {
        return;
      }

      const request: CreateWorkflow = {
          namespace: this.namespace,
          workflowTemplate: this.workflowTemplate,
          parameters: result.parameters,
      };

      this.workflowService.executeWorkflow(this.namespace, request)
        .subscribe(res => {
          this.router.navigate(['/', this.namespace, 'workflows', res.name]);
        }, err => {

        });
    });
  }

  showDag() {
    if (!this.dag) {
      return;
    }

    try {
      const g = NodeRenderer.createGraphFromManifest(this.workflowTemplateDetail.manifest);
      this.dag.display(g);
    } catch (e) {
      console.error(e);
    }
  }

  onTabChange(event: MatTabChangeEvent) {
    if (event.index === 1) {
      this.showDag();
    }
  }

  editSelectedWorkflowTemplateVersion() {
    this.router.navigate(['/', this.namespace, 'workflow-templates', this.workflowTemplateDetail.uid, 'edit']);
  }

  onWorkflowPageChange(event: PageEvent) {
    this.workflowPagination.page = event.pageIndex;
    this.workflowPagination.pageSize = event.pageSize;

    this.getWorkflows();
  }

  deleteWorkflowTemplate() {
    const dialog = this.dialog.open(ConfirmationDialogComponent, {
      width: '500px',
      data: {
        title: 'Are you sure you want to delete this template?',
        message: 'Once deleted, this template can not be brought back',
        confirmText: 'YES, DELETE TEMPLATE',
        type: 'delete'
      }
    });

    dialog.afterClosed().subscribe(res => {
      if (!res) {
        return;
      }

      this.workflowTemplateService.archiveWorkflowTemplate(this.namespace, this.uid)
          .subscribe(res => {
            this.router.navigate(['/', this.namespace, 'workflow-templates']);

            this.alertService.storeAlert(new Alert({
              message: `Workflow template '${this.workflowTemplate.name}' has been deleted`,
              type: 'success'
            }));
          })
    });
  }
}
