import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import {
    SimpleWorkflowDetail,
    Workflow,
    WorkflowDetail,
    WorkflowExecution,
    WorkflowService
} from '../workflow.service';
import { ActivatedRoute } from '@angular/router';
import { MatSnackBar } from "@angular/material/snack-bar";

@Component({
    selector: 'app-workflow-executions-list',
    templateUrl: './workflow-executions-list.component.html',
    styleUrls: ['./workflow-executions-list.component.scss'],
    providers: [ WorkflowService ]
})
export class WorkflowExecutionsListComponent implements OnInit, OnDestroy {
    displayedColumns = ['name','status', 'start', 'end', 'spacer', 'actions'];
    statusWatchers = new Map<string, WebSocket>();

    @Input() namespace: string;
    @Input() set workflows(value: Workflow[]) {
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

    ngOnInit(): void {
    }

    ngOnDestroy(): void {
        for(let key in this.statusWatchers) {
            this.statusWatchers[key].close();
        }
    }

    addStatusWatcher(workflowDetail: WorkflowExecution) {
        const self = this;
        this.workflowService.watchWorkflow(this.namespace, workflowDetail.name, (parsedData) => {
            if(parsedData.result.manifest) {
                workflowDetail.updateWorkflowManifest(parsedData.result.manifest);
            }
        });
    }

    onTerminate(workflow: WorkflowExecution) {
        this.workflowService.terminateWorkflow(this.namespace, workflow.name)
            .subscribe(res => {
                this.snackbar.open('Workflow stopped', 'OK');
            }, err => {
                this.snackbar.open('Unable to stop workflow', 'OK');
            })
    }
}
