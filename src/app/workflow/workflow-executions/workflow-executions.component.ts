import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { PageEvent } from '@angular/material/paginator';
import { ListWorkflowExecutionsResponse, WorkflowExecution, WorkflowServiceService, Workspace } from '../../../api';
import { ActivatedRoute } from '@angular/router';
import { Sort } from '@angular/material';

type WorkflowExecutionsState = 'initialization' | 'new' | 'loading';
export type WorkflowExecutionPhase = 'running' | 'completed' | 'failed' | 'stopped';

export interface WorkflowExecutionsChangedEvent {
  response: ListWorkflowExecutionsResponse;
  hasWorkflowExecutions: boolean;
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
  @Input() displayedColumns = ['name', 'status', 'createdAt', 'start', 'end', 'template', 'spacer', 'actions', 'labels'];
  @Input() sortOrder = 'createdAt,desc';
  @Input() showSystem = false;

  private previousSortOrder = 'createdAt,desc';

  // tslint:disable-next-line:variable-name
  private _phase?: WorkflowExecutionPhase;
  @Input() set phase(value: WorkflowExecutionPhase) {
    this._phase = value;
    this.page = 0;

    this.getWorkflows();
  }

  @Output() workflowsChanged = new EventEmitter<WorkflowExecutionsChangedEvent>();

  workflows: WorkflowExecution[] = [];
  workflowResponse: ListWorkflowExecutionsResponse;

  /**
   * refers to a setInterval. Used to make requests to update the workflows.
   */
  workflowsInterval: number;

  /**
   * workflowExecutionUpdatingMap keeps track of which workflows are being updated, these should not be updated
   * by the regular interval get request.
   *
   * When we perform an action on a workflow like terminate, etc,
   * it takes a second for API to update and respond. It is possible that the request does not finish
   * but we do another Get request in that time. So our status change may be terminate => running => terminate.
   * To prevent this, we mark the workflow as updating, so the Get request should ignore it.
   */
  private workflowExecutionUpdatingMap = new Map<string, Workspace>();

  workflowExecutionsState: WorkflowExecutionsState = 'initialization';
  hasWorkflowExecutions = false;

  lastUpdateRequest?: Date;
  lastUpdateRequestFinished?: Date;

  constructor(
      public activatedRoute: ActivatedRoute,
      public workflowService: WorkflowServiceService,
  ) { }

  ngOnInit() {
    this.activatedRoute.paramMap.subscribe(next => {
      this.getWorkflows();
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
   * Marks the workflow as updating.
   */
  private markWorkflowUpdating(workflowExecution: WorkflowExecution) {
    this.lastUpdateRequest = new Date();
  }

  /**
   * Marks the workflow as done updating.
   */
  private markWorkflowDoneUpdating(workflowExecution: WorkflowExecution) {
    this.lastUpdateRequestFinished = new Date();
  }

  /**
   * Update the current workflows list with a new one.
   *
   * This will replace the workflows if they are completely different, or
   * it will update the worfklow objects data if they are only different by data.
   *
   * This prevents UI issues where the entire list refreshes, which can remove any open menus
   * like the workflow action menu.
   */
  private updateWorkflowExecutionList(workflowExecutions: WorkflowExecution[]) {
    // If the lengths are different, we have new workflows or deleted workflows,
    // so just update the entire list.
    if ((this.workflows.length !== workflowExecutions.length) ||
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
    this.workflowService
        .listWorkflowExecutions(this.namespace, this.workflowTemplateUid, this.workflowTemplateVersion, pageSize, page, this.sortOrder, undefined, this._phase, this.showSystem)
        .subscribe(res => {
          if (page !== (this.page + 1) || pageSize !== this.pageSize) {
            return;
          }

          this.workflowResponse = res;
          const hasWorkflowExecutions = !(res.page === 1 && !res.workflowExecutions);

          if (!res.workflowExecutions) {
            res.workflowExecutions = [];
          }

          this.updateWorkflowExecutionList(res.workflowExecutions);

          this.workflowExecutionsState = 'new';
          this.hasWorkflowExecutions = hasWorkflowExecutions;
          this.workflowsChanged.emit({
            response: res,
            hasWorkflowExecutions
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
}
