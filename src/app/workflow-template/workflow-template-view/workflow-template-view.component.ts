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
import {
  CronWorkflow,
  CronWorkflowServiceService,
  KeyValue, ListCronWorkflowsResponse,
  WorkflowExecution,
  WorkflowServiceService
} from "../../../api";
import { MatTabGroup } from "@angular/material/tabs";
import { AppRouter } from "../../router/app-router.service";
import { WorkflowTemplateCloneDialog, WorkflowTemplateCloneData } from "../../dialog/input-dialog/workflow-template-clone-dialog.component";

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

  @ViewChild(MatTabGroup, {static: false}) matTabGroup: MatTabGroup;

  manifestText: string;
  namespace: string;
  uid: string;

  workflows: Workflow[] = [];
  cronWorkflowResponse: ListCronWorkflowsResponse;
  cronWorkflows: CronWorkflow[] = [];
  workflowResponse: WorkflowResponse;
  workflowPagination = new Pagination();
  cronWorkflowPagination = new Pagination();

  private _hasWorkflowExecutions = false;
  set hasWorkflowExecutions(value: boolean) {
    this._hasWorkflowExecutions = value;

    this.updateShowWorkflowExecutionCallToAction();
  }
  get hasWorkflowExecutions(): boolean {
    return this._hasWorkflowExecutions
  }

  private _hasCronWorkflows = false;
  set hasCronWorkflows(value: boolean) {
    this._hasCronWorkflows = value;

    this.updateShowCronWorkflowsCallToAction();
  }
  get hasCronWorkflows(): boolean {
    return this._hasCronWorkflows;
  }

  labels = new Array<KeyValue>();
  showWorkflowExecutionsCallToAction = false;
  showCronWorkflowsCallToAction = false;

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
    private appRouter: AppRouter,
    private activatedRoute: ActivatedRoute,
    private workflowService: WorkflowService,
    private cronWorkflowService: CronWorkflowServiceService,
    private workflowServiceService: WorkflowServiceService,
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
      this.getCronWorkflows();
      this.getLabels();
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
        if(!res.workflowTemplates) {
          return;
        }

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

  executeWorkflow(e?: any, cron: boolean = false) {
    if(e) {
      e.preventDefault();
    }

    const dialogRef = this.dialog.open(WorkflowExecuteDialogComponent, {
      width: '60vw',
      maxHeight: '100vh',
      data: {
        manifest: this.manifestText,
        cron: cron,
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (!result) {
        return;
      }

      if(result.cron) {
        result.workflowExecution.workflowTemplate = this.workflowTemplate;

        const request: CronWorkflow = {
          schedule: result.cron.schedule,
          timezone: result.cron.timezone,
          suspend: result.cron.suspend,
          concurrencyPolicy: result.cron.concurrencyPolicy,
          startingDeadlineSeconds: result.cron.startingDeadlineSeconds,
          successfulJobsHistoryLimit: result.cron.successfulJobsHistoryLimit,
          failedJobsHistoryLimit: result.cron.failedJobsHistoryLimit,
          workflowExecution: result.workflowExecution
        };

        this.executeCronWorkflowRequest(request, result.labels);

      } else {
        const request: CreateWorkflow = {
          namespace: this.namespace,
          workflowTemplate: this.workflowTemplate,
          parameters: result.workflowExecution.parameters,
        };

        this.executeWorkflowRequest(request, result.labels);
      }
    });
  }

  protected executeWorkflowRequest(request: CreateWorkflow, labels: any) {
    this.workflowService.executeWorkflow(this.namespace, request)
        .subscribe(res => {
          this.workflowServiceService.addWorkflowExecutionLabels(this.namespace, res.name, {
            items: labels
          })
              .subscribe(res => {
                // Do nothing
              }, err => {
                // Do nothing
              }, () => {
                this.router.navigate(['/', this.namespace, 'workflows', res.name]);
              });

        }, err => {

        });
  }

  protected executeCronWorkflowRequest(data: CronWorkflow, labels: any) {
      this.cronWorkflowService.createCronWorkflow(this.namespace, data)
          .subscribe(res => {
            this.getCronWorkflows();
            this.matTabGroup.selectedIndex = 1;
            this.alertService.storeAlert(new Alert({
              message: `You have scheduled "${res.name}"`,
              type: "success"
            }))
          }, err => {

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
    this.updateShowWorkflowExecutionCallToAction();
    this.updateShowCronWorkflowsCallToAction();
  }

  editSelectedWorkflowTemplateVersion() {
    this.router.navigate(['/', this.namespace, 'workflow-templates', this.workflowTemplateDetail.uid, 'edit']);
  }

  cloneSelectedWorkflowTemplateVersion() {
    let data : WorkflowTemplateCloneData = {
      title: 'Cloned template name',
      inputLabel: 'Name',
      defaultValue: this.workflowTemplate.name + '-clone',
      namespace: this.namespace,
      uid: this.uid,
      version: this._selectedWorkflowTemplateVersionValue
    };

    const dialog = this.dialog.open(WorkflowTemplateCloneDialog, {
      width: '400px',
      data: data
    });

    dialog.afterClosed().subscribe(res => {
      if(!res) {
        return;
      }

      this.alertService.storeAlert(new Alert({
        message: `You are now viewing "${res.name}".`,
        type: "success"
      }));

      this.appRouter.navigateToWorkflowTemplateView(this.namespace, res.uid);
    });

    return;
  }

  onWorkflowPageChange(event: PageEvent) {
    this.workflowPagination.page = event.pageIndex;
    this.workflowPagination.pageSize = event.pageSize;

    this.getWorkflows();
  }

  onCronWorkflowPageChange(event: PageEvent) {
    this.cronWorkflowPagination.page = event.pageIndex;
    this.cronWorkflowPagination.pageSize = event.pageSize;

    this.getCronWorkflows();
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

  getLabels() {
    this.workflowServiceService.getWorkflowTemplateLabels(this.namespace, this.uid)
        .subscribe(res => {
          if(!res.labels) {
            return;
          }

          this.labels = res.labels;
        })
  }

  getCronWorkflows() {
    // Tab is 0 based, so we add 1, since API is 1 based.
    const page = this.cronWorkflowPagination.page + 1;
    const pageSize = this.cronWorkflowPagination.pageSize;

    this.cronWorkflowService.listCronWorkflows(this.namespace, this.uid, pageSize, page)
        .subscribe(res => {
          this.cronWorkflowResponse = res;
          this.cronWorkflows = res.cronWorkflows;

          this.hasCronWorkflows = !(page === 1 && !res.cronWorkflows);
        })
  }

  updateShowWorkflowExecutionCallToAction() {
    if(!this.matTabGroup) {
      return;
    }

    this.showWorkflowExecutionsCallToAction = !this.hasWorkflowExecutions && this.matTabGroup.selectedIndex === 0;
  }

  updateShowCronWorkflowsCallToAction() {
    if(!this.matTabGroup) {
      return;
    }

    this.showCronWorkflowsCallToAction = !this.hasCronWorkflows && this.matTabGroup.selectedIndex === 1;
  }
}
