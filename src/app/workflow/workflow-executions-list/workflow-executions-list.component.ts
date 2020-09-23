import { Component, EventEmitter, Input, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import {
    WorkflowService
} from '../workflow.service';
import { ActivatedRoute } from '@angular/router';
import { MatSnackBar, MatSnackBarRef, SimpleSnackBar } from '@angular/material/snack-bar';
import { AuthServiceService, WorkflowExecution, WorkflowServiceService, Workspace } from '../../../api';
import { ConfirmationDialogComponent } from '../../confirmation-dialog/confirmation-dialog.component';
import { WorkflowExecutionConstants } from '../models';
import { MatDialog } from '@angular/material/dialog';
import { Permissions } from '../../auth/models';
import { combineLatest } from 'rxjs';
import { map } from 'rxjs/operators';
import { AppRouter } from '../../router/app-router.service';
import { AlertService } from '../../alert/alert.service';
import { Alert } from '../../alert/alert';
import { Sort } from '@angular/material';

@Component({
    selector: 'app-workflow-executions-list',
    templateUrl: './workflow-executions-list.component.html',
    styleUrls: ['./workflow-executions-list.component.scss'],
    providers: [ WorkflowService ]
})
export class WorkflowExecutionsListComponent implements OnInit, OnDestroy {
    private snackbarRef: MatSnackBarRef<SimpleSnackBar>;

    @Input() displayedColumns = ['name', 'status', 'start', 'end', 'template', 'spacer', 'actions'];

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
        this.alertService.storeAlert(new Alert({
            message: `Cloning ${workflowExecution.name}`,
            type: 'info'
        }));

        this.workflowServiceService.cloneWorkflowExecution(this.namespace, workflowExecution.uid)
            .subscribe(res => {
                this.appRouter.navigateToWorkflowExecution(this.namespace, res.uid);
            }, err => {
                this.alertService.storeAlert(new Alert({
                    message: `Unable to run ${workflowExecution.name} again`,
                    type: 'danger'
                }));
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

        const canCreate$ = this.authService.isAuthorized({
            namespace: this.namespace,
            verb: 'create',
            resource: 'workspaces',
            resourceName: workflowExecution.uid,
            group: 'onepanel.io',
        });

        const canDelete$ = this.authService.isAuthorized({
            namespace: this.namespace,
            verb: 'delete',
            resource: 'workspaces',
            resourceName: workflowExecution.uid,
            group: 'onepanel.io',
        });

        combineLatest([canCreate$, canDelete$])
            .pipe(
                map(([canCreate$, canDelete$]) => ({
                    canCreate: canCreate$,
                    canDelete: canDelete$
                }))
            ).subscribe(res => {
            this.workflowExecutionPermissions.set(
                workflowExecution.uid,
                new Permissions({
                    delete: res.canDelete.authorized,
                    create: res.canCreate.authorized
                })
            );
        });
    }

    sortData(event: Sort) {
        this.sortChange.emit(event);
    }
}
