import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import {
    SimpleWorkflowDetail,
    Workflow,
    WorkflowDetail,
    WorkflowExecution,
    WorkflowService
} from '../workflow.service';
import { ActivatedRoute } from '@angular/router';

@Component({
    selector: 'app-workflow-executions-list',
    templateUrl: './workflow-executions-list.component.html',
    styleUrls: ['./workflow-executions-list.component.scss'],
    providers: [ WorkflowService ]
})
export class WorkflowExecutionsListComponent implements OnInit, OnDestroy {
    displayedColumns = ['name', 'createdAt', 'status', 'spacer', 'actions'];
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
        private workflowService: WorkflowService) { }

    ngOnInit(): void {
    }

    ngOnDestroy(): void {
        for(let key in this.statusWatchers) {
            this.statusWatchers[key].close();
        }
    }

    addStatusWatcher(workflowDetail: WorkflowExecution) {
        const watcher = this.workflowService.watchWorkflow(this.namespace, workflowDetail.name);
        this.statusWatchers[workflowDetail.uid] = watcher;

        watcher.onmessage = (event) => {
            const parsedData = JSON.parse(event.data);
            if(parsedData.result.manifest) {
                workflowDetail.updateWorkflowManifest(parsedData.result.manifest);
            }
        }
    }
}
