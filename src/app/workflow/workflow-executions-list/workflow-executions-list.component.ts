import { Component, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import {
    Workflow,
    WorkflowExecution,
    WorkflowService
} from '../workflow.service';
import { ActivatedRoute } from '@angular/router';
import { MatSnackBar } from "@angular/material/snack-bar";
import { Subscription } from "rxjs";

@Component({
    selector: 'app-workflow-executions-list',
    templateUrl: './workflow-executions-list.component.html',
    styleUrls: ['./workflow-executions-list.component.scss'],
    providers: [ WorkflowService ]
})
export class WorkflowExecutionsListComponent implements OnInit, OnDestroy {
    displayedColumns = ['name','status', 'start', 'end', 'spacer', 'actions'];
    watchingWorkflowsMap = new Map<string, Subscription>();

    @Input() namespace: string;
    @Input() set workflows(value: Workflow[]) {
        this.clearWatchers();

        let formattedList = [];

        for(let workflow of value) {
            const formatted = new WorkflowExecution(workflow);
            formattedList.push(formatted);

            if (formatted.active) {
                this.addStatusWatcher(formatted);
            }
        }

        this.executionWorkflows = formattedList;

        return;
    }

    executionWorkflows: WorkflowExecution[] = [];

    constructor(
        private activatedRoute: ActivatedRoute,
        private workflowService: WorkflowService,
        private snackbar: MatSnackBar) { }

    clearWatchers() {
        for(let item of this.watchingWorkflowsMap.entries()) {
            item[1].unsubscribe();
        }

        this.watchingWorkflowsMap.clear();
    }

    ngOnInit(): void {

    }

    ngOnDestroy(): void {
        this.clearWatchers();
    }

    addStatusWatcher(workflowDetail: WorkflowExecution) {
        const key = this.key(this.namespace, workflowDetail.name);

        // Already watching, so don't create another watcher.
        if(this.watchingWorkflowsMap.get(key)) {
            return;
        }

        const subscription = this.workflowService.watchWorkflow(this.namespace, workflowDetail.name)
            .subscribe((parsedData: any) => {
                if(parsedData.result.manifest) {
                    workflowDetail.updateWorkflowManifest(parsedData.result.manifest);
                }
            }, err => {
                console.error(err);
            });

        this.watchingWorkflowsMap.set(key, subscription);
    }

    onTerminate(workflow: WorkflowExecution) {
        this.workflowService.terminateWorkflow(this.namespace, workflow.name)
            .subscribe(res => {
                this.snackbar.open('Workflow stopped', 'OK');
            }, err => {
                this.snackbar.open('Unable to stop workflow', 'OK');
            })
    }

    key(namespace: string, name:string): string {
        return `${namespace}_${name}`;
    }
}
