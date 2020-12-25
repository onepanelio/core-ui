import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { PageEvent } from '@angular/material/paginator';
import { ListWorkflowExecutionsResponse, WorkflowExecution, WorkflowServiceService, Workspace } from '../../../api';
import { ActivatedRoute } from '@angular/router';
import { Sort } from '@angular/material';
import { FilterChangedEvent } from '../../list-filter/list-filter.component';

type WorkflowExecutionsState = 'initialization' | 'new' | 'loading';
export type WorkflowExecutionPhase = 'running' | 'completed' | 'failed' | 'stopped';

export interface WorkflowExecutionsChangedEvent {
    response: ListWorkflowExecutionsResponse;
    hasAnyWorkflows: boolean;
}

@Component({
    selector: 'app-workflow-executions',
    templateUrl: './workflow-executions.component.html',
    styleUrls: ['./workflow-executions.component.scss']
})
export class WorkflowExecutionsComponent implements OnInit, OnDestroy {
    @Input() namespace: string;
    @Input() workflowTemplateUid?: string;
    @Input() workflowTemplateVersion?: string;
    @Input() page = 0;
    @Input() pageSize = 15;
    @Input() sortOrder = 'createdAt,desc';
    @Input() showSystem = false;
    @Input() showFilter = true;
    @Input() showPaginator = true;

    private previousSortOrder = 'createdAt,desc';

    // tslint:disable-next-line:variable-name
    private _phase?: WorkflowExecutionPhase;
    @Input() set phase(value: WorkflowExecutionPhase) {
        this._phase = value;
        this.page = 0;

        this.getWorkflows();
    }

    @Output() workflowsChanged = new EventEmitter<WorkflowExecutionsChangedEvent>();

    workflows?: WorkflowExecution[];
    workflowResponse: ListWorkflowExecutionsResponse;

    /**
     * refers to a setInterval. Used to make requests to update the workflows.
     */
    workflowsInterval: number;

    workflowExecutionsState: WorkflowExecutionsState = 'initialization';
    lastUpdateRequest?: Date;
    lastUpdateRequestFinished?: Date;

    hasAnyWorkflowExecutions = false;

    private labelFilter?: string;
    private previousListUpdate = (new Date()).getTime();

    constructor(
        public activatedRoute: ActivatedRoute,
        public workflowService: WorkflowServiceService,
    ) {
    }

    ngOnInit() {
        this.activatedRoute.paramMap.subscribe(next => {
            this.getWorkflows();

            if (this.workflowsInterval) {
                clearInterval(this.workflowsInterval);
            }

            this.workflowsInterval = setInterval(() => {
                this.getWorkflows();
            }, 5000);
        });
    }

    ngOnDestroy() {
        if (this.workflowsInterval) {
            clearInterval(this.workflowsInterval);
            this.workflowsInterval = null;
        }
    }

    /**
     * Update the current workflows list with a new one.
     *
     * This will replace the workflows if they are completely different, or
     * it will update the workflow objects data if they are only different by data.
     *
     * This prevents UI issues where the entire list refreshes, which can remove any open menus
     * like the workflow action menu.
     */
    private updateWorkflowExecutionList(workflowExecutions: WorkflowExecution[], timestamp: number) {
        if (timestamp < this.previousListUpdate) {
            return;
        }

        this.previousListUpdate = timestamp;

        // If the lengths are different, we have new workflows or deleted workflows,
        // so just update the entire list.
        if ( this.workflows === undefined || (this.workflows.length !== workflowExecutions.length) ||
            (this.previousSortOrder !== this.sortOrder)) {
            this.workflows = workflowExecutions;
            return;
        }

        const map = new Map<string, WorkflowExecution>();
        for (const workflow of this.workflows) {
            map.set(workflow.uid, workflow);
        }

        for (const workflowExecution of workflowExecutions) {
            const existingWorkflow = map.get(workflowExecution.uid);

            // If the workflow isn't in our existing ones, we need to update the entire list.
            // There are missing or deleted workflows.
            if (!existingWorkflow) {
                this.workflows = workflowExecutions;
                break;
            }

            existingWorkflow.phase = workflowExecution.phase;
            existingWorkflow.startedAt = workflowExecution.startedAt;
            existingWorkflow.finishedAt = workflowExecution.finishedAt;
            existingWorkflow.workflowTemplate = workflowExecution.workflowTemplate;
            existingWorkflow.labels = workflowExecution.labels;
        }
    }

    getWorkflows() {
        if (!this.namespace) {
            return;
        }

        if (this.workflowExecutionsState !== 'initialization') {
            this.workflowExecutionsState = 'loading';
        }

        if (this.lastUpdateRequest && !this.lastUpdateRequestFinished) {
            return;
        }

        this.lastUpdateRequest = undefined;
        this.lastUpdateRequestFinished = undefined;

        // +1 for API
        const page = this.page + 1;
        const pageSize = this.pageSize;

        const now = (new Date()).getTime();

        this.workflowService
            .listWorkflowExecutions(this.namespace, this.workflowTemplateUid, this.workflowTemplateVersion, pageSize, page, this.sortOrder, this.labelFilter, this._phase, this.showSystem)
            .subscribe(res => {
                if (page !== (this.page + 1) || pageSize !== this.pageSize) {
                    return;
                }

                this.workflowResponse = res;
                this.hasAnyWorkflowExecutions = !!(res.totalAvailableCount && res.totalAvailableCount !== 0);

                if (!res.workflowExecutions) {
                    res.workflowExecutions = [];
                }

                this.updateWorkflowExecutionList(res.workflowExecutions, now);

                this.workflowExecutionsState = 'new';
                this.workflowsChanged.emit({
                    response: res,
                    hasAnyWorkflows: this.hasAnyWorkflowExecutions
                });
            });
    }

    onPageChange(event: PageEvent) {
        this.page = event.pageIndex;
        this.pageSize = event.pageSize;

        this.getWorkflows();
    }

    onWorkflowExecutionTerminated() {
        this.getWorkflows();
    }

    sortData(event: Sort) {
        let field = event.active;
        switch (event.active) {
            case 'start':
                field = 'startedAt';
                break;
            case 'end':
                field = 'finishedAt';
                break;
            case 'status':
                field = 'phase';
                break;
        }

        this.previousSortOrder = this.sortOrder;
        this.sortOrder = `${field},${event.direction}`;

        // default sort order.
        if (event.direction === '') {
            this.sortOrder = `createdAt,desc`;
        }

        this.getWorkflows();
    }

    labelsChanged(event: FilterChangedEvent) {
        this.labelFilter = event.filterString;

        this.getWorkflows();
    }
}
