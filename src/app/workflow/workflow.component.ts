import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { WorkflowExecutionPhase, WorkflowExecutionsChangedEvent } from './workflow-executions/workflow-executions.component';
import { WorkflowExecuteDialogComponent } from './workflow-execute-dialog/workflow-execute-dialog.component';
import { CreateWorkflowExecutionBody, WorkflowServiceService } from '../../api';
import { MatDialog } from '@angular/material/dialog';
import { Alert } from '../alert/alert';
import { AppRouter } from '../router/app-router.service';
import { AlertService } from '../alert/alert.service';

@Component({
  selector: 'app-workflow',
  templateUrl: './workflow.component.html',
  styleUrls: ['./workflow.component.scss']
})
export class WorkflowComponent implements OnInit {
  namespace: string;
  workflowExecutionPhase?: WorkflowExecutionPhase;
  displayedColumns = ['name', 'status', 'start', 'end', 'version', 'spacer', 'actions'];
  hasWorkflowExecutions?: boolean;
  pageSize = 15;

  constructor(
      private activatedRoute: ActivatedRoute,
      private dialog: MatDialog,
      private appRouter: AppRouter,
      private alertService: AlertService,
      private workflowServiceService: WorkflowServiceService
  ) {
    this.activatedRoute.paramMap.subscribe(next => {
      this.namespace = next.get('namespace');

    });
  }

  ngOnInit() {
  }

  onWorkflowsChanged(res: WorkflowExecutionsChangedEvent) {
    this.hasWorkflowExecutions = res.hasWorkflowExecutions;
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

      const request: CreateWorkflowExecutionBody = {
        workflowTemplateUid: result.workflowTemplate.uid,
        parameters: result.workflowExecution.parameters,
        labels: result.workflowExecution.labels,
      };

      this.workflowServiceService.createWorkflowExecution(this.namespace, request)
          .subscribe(res => {
            this.appRouter.navigateToWorkflowExecution(this.namespace, res.name);
          }, err => {
            this.alertService.storeAlert(new Alert({
              message: 'Unable to execute workflow',
              type: 'danger'
            }));
          });
    });
  }
}
