import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import {
    WorkflowService
} from '../workflow.service';
import { ActivatedRoute } from '@angular/router';
import { MatSnackBar, MatSnackBarRef, SimpleSnackBar } from '@angular/material/snack-bar';
import { AuthServiceService, CreateWorkflowExecutionBody, WorkflowExecution, WorkflowServiceService } from '../../../api';
import { ConfirmationDialogComponent } from '../../confirmation-dialog/confirmation-dialog.component';
import { WorkflowExecutionConstants } from '../models';
import { MatDialog } from '@angular/material/dialog';
import { Permissions } from '../../auth/models';
import { AppRouter } from '../../router/app-router.service';
import { AlertService } from '../../alert/alert.service';
import { Alert } from '../../alert/alert';
import { Sort } from '@angular/material';
import { SortDirection } from '@angular/material/typings/sort';
import { PermissionService } from '../../permissions/permission.service';
import { WorkflowExecuteDialogComponent } from '../workflow-execute-dialog/workflow-execute-dialog.component';

@Component({
    selector: 'app-workflow-executions-list',
    templateUrl: './workflow-executions-list.component.html',
    styleUrls: ['./workflow-executions-list.component.scss'],
    providers: [ WorkflowService ]
})
export class WorkflowExecutionsListComponent implements OnInit, OnDestroy {
    private snackbarRef: MatSnackBarRef<SimpleSnackBar>;
    showAllMetrics = new Map<string, boolean>();

    @Input() displayedColumns = ['name', 'status', 'start', 'end', 'metrics', 'template', 'createdAt', 'spacer', 'actions', 'labels'];
    @Input() sort = 'createdAt';
    @Input() sortDirection: SortDirection = 'desc';

    @Input() namespace: string;
    @Input() workflowExecutions: WorkflowExecution[] = [];

    @Output() executionTerminated = new EventEmitter();
    @Output() sortChange = new EventEmitter<Sort>();

    /**
     * workflowPermissions keeps track of which permissions the currently logged in user has for each
     * workflow.
     *
     * Right now, a network request is made (if we don't already have data),
     * to get these permissions.
     */
    workflowExecutionPermissions = new Map<string, Permissions>();

    constructor(
        private appRouter: AppRouter,
        private alertService: AlertService,
        private authService: AuthServiceService,
        private permissionService: PermissionService,
        private activatedRoute: ActivatedRoute,
        private workflowService: WorkflowService,
        private workflowServiceService: WorkflowServiceService,
        private dialog: MatDialog,
        private snackbar: MatSnackBar) { }

    ngOnInit(): void {
    }

    ngOnDestroy(): void {
        if (this.snackbarRef) {
            this.snackbarRef.dismiss();
        }
    }

    onDelete(workflow: WorkflowExecution) {
        const dialog = this.dialog.open(ConfirmationDialogComponent, {
            data: WorkflowExecutionConstants.getConfirmTerminateDialogData(workflow.name),
        });

        dialog.afterClosed().subscribe(res => {
            if (!res) {
                return;
            }

            this.workflowServiceService.terminateWorkflowExecution(this.namespace, workflow.uid)
                .subscribe( () => {
                    workflow.phase = 'Terminated';
                    workflow.finishedAt = (new Date()).toLocaleDateString();
                    this.snackbarRef = this.snackbar.open('Workflow terminated', 'OK');
                    this.executionTerminated.emit();
                }, () => {
                    this.snackbarRef = this.snackbar.open('Unable to terminate workflow', 'OK');
                });
        });
    }

    onRerun(workflowExecution: WorkflowExecution) {
        const dialogRef = this.dialog.open(WorkflowExecuteDialogComponent, {
            width: '60vw',
            maxHeight: '100vh',
            data: {
                namespace: this.namespace,
                parameters: workflowExecution.parameters,
                labels: workflowExecution.labels,
                loadWorkflowTemplate: true,
                workflowTemplate: workflowExecution.workflowTemplate,
            }
        });

        dialogRef.afterClosed().subscribe(result => {
            if (!result) {
                return;
            }

            const request: CreateWorkflowExecutionBody = {
                workflowTemplateUid: workflowExecution.workflowTemplate.uid,
                workflowTemplateVersion: workflowExecution.workflowTemplate.version,
                parameters: result.workflowExecution.parameters,
                labels: result.workflowExecution.labels,
            };

            this.workflowServiceService.createWorkflowExecution(this.namespace, request)
                .subscribe(res => {
                    this.appRouter.navigateToWorkflowExecution(this.namespace, res.name);
                }, err => {
                    this.alertService.storeAlert(new Alert({
                        message: 'Unable to clone workflow',
                        type: 'danger'
                    }));
                });
        });
    }

    /**
     * onMatMenuOpen happens when the menu is opened for a workspace list item.
     * We get the permissions for the workspace for the current logged in user, if no
     * permissions have been loaded yet.
     *
     */
    onMatMenuOpen(workflowExecution: WorkflowExecution) {
        if (this.workflowExecutionPermissions.has(workflowExecution.uid)) {
            return;
        }

        this.permissionService.getWorkflowPermissions(this.namespace, workflowExecution.uid, 'create', 'update')
            .subscribe( res => {
                this.workflowExecutionPermissions.set(workflowExecution.uid, res);
            });
    }

    sortData(event: Sort) {
        this.sort = event.active;
        this.sortDirection = event.direction;

        this.sortChange.emit(event);
    }

    toggleShowMetrics(workflowUid: string) {
        if (this.showAllMetrics.get(workflowUid)) {
            this.showAllMetrics.set(workflowUid, false);
        } else {
            this.showAllMetrics.set(workflowUid, true);
        }
    }
}
