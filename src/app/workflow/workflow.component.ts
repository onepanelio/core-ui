import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { WorkflowExecutionPhase, WorkflowExecutionsChangedEvent } from './workflow-executions/workflow-executions.component';
import { WorkflowExecuteDialogComponent } from './workflow-execute-dialog/workflow-execute-dialog.component';
import { CreateWorkflowExecutionBody, CronWorkflow, CronWorkflowServiceService, WorkflowServiceService } from '../../api';
import { MatDialog } from '@angular/material/dialog';
import { Alert } from '../alert/alert';
import { AppRouter } from '../router/app-router.service';
import { AlertService } from '../alert/alert.service';
import { Permissions } from '../auth/models';
import { PermissionService } from '../permissions/permission.service';

@Component({
  selector: 'app-workflow',
  templateUrl: './workflow.component.html',
  styleUrls: ['./workflow.component.scss']
})
export class WorkflowComponent implements OnInit {
  namespace: string;
  workflowExecutionPhase?: WorkflowExecutionPhase;
  hasWorkflowExecutions?: boolean;
  pageSize = 15;

  workflowPermissions = new Permissions();

  constructor(
      private activatedRoute: ActivatedRoute,
      private dialog: MatDialog,
      private appRouter: AppRouter,
      private alertService: AlertService,
      private workflowServiceService: WorkflowServiceService,
      private cronWorkflowService: CronWorkflowServiceService,
      private permissionService: PermissionService,
  ) {
    this.activatedRoute.paramMap.subscribe(next => {
      this.namespace = next.get('namespace');
    });

    this.checkPermissions(this.namespace);
  }

  ngOnInit() {
  }

  workflowsChanged(event: WorkflowExecutionsChangedEvent) {
    this.hasWorkflowExecutions = event.hasAnyWorkflows;
  }

  executeWorkflow(e?: any) {
    if (e) {
      e.preventDefault();
    }

    const dialogRef = this.dialog.open(WorkflowExecuteDialogComponent, {
      width: '60vw',
      maxHeight: '100vh',
      data: {
        namespace: this.namespace,
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (!result) {
        return;
      }

      if (result.cron) {
        const request: CronWorkflow = {
          manifest: result.cron.manifest,
          workflowExecution: result.workflowExecution,
          labels: result.workflowExecution.labels,
        };

        this.executeCronWorkflowRequest(request);

      } else {
        const request: CreateWorkflowExecutionBody = {
          workflowTemplateUid: result.workflowTemplate.uid,
          parameters: result.workflowExecution.parameters,
          labels: result.workflowExecution.labels,
        };

        this.executeWorkflowRequest(request);
      }
    });
  }

  protected executeWorkflowRequest(request: CreateWorkflowExecutionBody) {
    this.workflowServiceService.createWorkflowExecution(this.namespace, request)
        .subscribe(res => {
          this.appRouter.navigateToWorkflowExecution(this.namespace, res.name);
        }, err => {
          this.alertService.storeAlert(new Alert({
            message: 'Unable to execute workflow',
            type: 'danger'
          }));
        });
  }

  protected executeCronWorkflowRequest(data: CronWorkflow) {
    this.cronWorkflowService.createCronWorkflow(this.namespace, data)
        .subscribe(res => {
          this.alertService.storeAlert(new Alert({
            message: `You have scheduled "${res.name}"`,
            type: 'success'
          }));
        }, err => {
          this.alertService.storeAlert(new Alert({
            message: 'Unable to schedule workflow',
            type: 'danger'
          }));
        });
  }

  private checkPermissions(namespace: string) {
    this.permissionService
        .getWorkflowPermissions(namespace, '', 'create', 'list')
        .subscribe(res => {
          this.workflowPermissions = res;
        });
  }
}
