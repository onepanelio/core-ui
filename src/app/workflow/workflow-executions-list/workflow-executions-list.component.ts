import { Component, EventEmitter, Input, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import {
    Workflow,
    WorkflowExecution,
    WorkflowService
} from '../workflow.service';
import { ActivatedRoute } from '@angular/router';
import { MatSnackBar, MatSnackBarRef, SimpleSnackBar } from "@angular/material/snack-bar";
import { Subscription } from "rxjs";
import { WorkflowServiceService } from "../../../api";

@Component({
    selector: 'app-workflow-executions-list',
    templateUrl: './workflow-executions-list.component.html',
    styleUrls: ['./workflow-executions-list.component.scss'],
    providers: [ WorkflowService ]
})
export class WorkflowExecutionsListComponent implements OnInit, OnDestroy {
    private snackbarRef: MatSnackBarRef<SimpleSnackBar>;

    displayedColumns = ['name','status', 'start', 'end', 'spacer', 'actions'];
    watchingWorkflowsMap = new Map<string, WebSocket>();
    executionWorkflowsMap = new Map<string, WorkflowExecution>();

    @Output() executionTerminated = new EventEmitter();

    @Input() namespace: string;
    @Input() set workflows(value: Workflow[]) {
        // Check if we have any new data. If we don't, don't update.
        // This is done because this method may be called repeated on a timer.
        let newData = false;
        if(value.length !== this.executionWorkflowsMap.size) {
            newData = true;
        } else {
            for (let workflow of value) {
                if (!this.executionWorkflowsMap.has(workflow.uid)) {
                    newData = true;
                    break;
                }
            }
        }

        if(!newData) {
            return;
        }

        this.executionWorkflowsMap.clear();

        this.clearWatchers();

        let formattedList = [];

        for(let workflow of value) {
            const formatted = new WorkflowExecution(workflow);
            formattedList.push(formatted);

            if (formatted.active) {
                this.addStatusWatcher(formatted);
            }

            this.executionWorkflowsMap.set(workflow.uid, formatted);
        }

        this.executionWorkflows = formattedList;

        return;
    }

    executionWorkflows: WorkflowExecution[] = [];

    constructor(
        private activatedRoute: ActivatedRoute,
        private workflowService: WorkflowService,
        private workflowServiceService: WorkflowServiceService,
        private snackbar: MatSnackBar) { }

    clearWatchers() {
        for(let item of this.watchingWorkflowsMap.entries()) {
            item[1].close();
        }

        this.watchingWorkflowsMap.clear();
    }

    ngOnInit(): void {

    }

    ngOnDestroy(): void {
        this.clearWatchers();
        if (this.snackbarRef) {
            this.snackbarRef.dismiss();
        }
    }

    addStatusWatcher(workflowDetail: WorkflowExecution) {
        const key = this.key(this.namespace, workflowDetail.name);

        // Already watching, so don't create another watcher.
        if(this.watchingWorkflowsMap.get(key)) {
            return;
        }

        const socket = this.workflowService.watchWorkflow(this.namespace, workflowDetail.name);
        socket.onmessage = (event) => {
            let parsedData;
            try {
                parsedData = JSON.parse(event.data);
            } catch (e) {
                return;
            }

            if(parsedData.result && parsedData.result.manifest) {
                workflowDetail.updateWorkflowManifest(parsedData.result.manifest);
            }
        };

        this.watchingWorkflowsMap.set(key, socket);
    }

    onTerminate(workflow: WorkflowExecution) {
        this.workflowServiceService.terminateWorkflowExecution(this.namespace, workflow.uid)
            .subscribe(res => {
                const key = this.key(this.namespace, workflow.name);
                if(this.watchingWorkflowsMap.has(key)) {
                    this.watchingWorkflowsMap.get(key).close();
                    this.watchingWorkflowsMap.delete(key);
                }
                workflow.phase = 'Terminated';
                workflow.finishedAt = new Date();
                this.snackbarRef = this.snackbar.open('Workflow terminated', 'OK');
                this.executionTerminated.emit();
            }, err => {
                this.snackbarRef = this.snackbar.open('Unable to terminate workflow', 'OK');
            })
    }

    key(namespace: string, name:string): string {
        return `${namespace}_${name}`;
    }
}
