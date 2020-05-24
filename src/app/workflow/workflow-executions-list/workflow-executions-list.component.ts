import { Component, EventEmitter, Input, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import {
    WorkflowService
} from '../workflow.service';
import { ActivatedRoute } from '@angular/router';
import { MatSnackBar, MatSnackBarRef, SimpleSnackBar } from "@angular/material/snack-bar";
import { WorkflowExecution, WorkflowServiceService } from "../../../api";
import { ConfirmationDialogComponent } from "../../confirmation-dialog/confirmation-dialog.component";
import { WorkflowExecutionConstants } from "../models";
import { MatDialog } from "@angular/material/dialog";

@Component({
    selector: 'app-workflow-executions-list',
    templateUrl: './workflow-executions-list.component.html',
    styleUrls: ['./workflow-executions-list.component.scss'],
    providers: [ WorkflowService ]
})
export class WorkflowExecutionsListComponent implements OnInit, OnDestroy {
    private snackbarRef: MatSnackBarRef<SimpleSnackBar>;

    displayedColumns = ['name','status', 'start', 'end', 'spacer', 'actions'];

    @Input() namespace: string;
    @Input() workflowExecutions: WorkflowExecution[] = [];

    @Output() executionTerminated = new EventEmitter();

    constructor(
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

    onTerminate(workflow: WorkflowExecution) {
        const dialog = this.dialog.open(ConfirmationDialogComponent, {
            data: WorkflowExecutionConstants.getConfirmTerminateDialogData(workflow.name),
        })

        dialog.afterClosed().subscribe(res => {
            if(!res) {
                return;
            }

            this.workflowServiceService.terminateWorkflowExecution(this.namespace, workflow.uid)
                .subscribe(res => {
                    workflow.phase = 'Terminated';
                    workflow.finishedAt = (new Date()).toLocaleDateString();
                    this.snackbarRef = this.snackbar.open('Workflow terminated', 'OK');
                    this.executionTerminated.emit();
                }, err => {
                    this.snackbarRef = this.snackbar.open('Unable to terminate workflow', 'OK');
                })
        })
    }
}
