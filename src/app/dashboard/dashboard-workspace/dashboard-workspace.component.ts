import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { WorkflowExecutionPhase, WorkflowExecutionsChangedEvent } from '../../workflow/workflow-executions/workflow-executions.component';
import { WorkspacesChangedEvent } from '../../workspace/workspaces/workspaces.component';

@Component({
  selector: 'app-dashboard-workspace',
  templateUrl: './dashboard-workspace.component.html',
  styleUrls: ['./dashboard-workspace.component.scss']
})
export class DashboardWorkspaceComponent implements OnInit, OnDestroy {
  // tslint:disable-next-line:variable-name
  _namespace: string;
  @Input() set namespace(value: string|undefined) {
    if (value === undefined) {
      return;
    }

    this._namespace = value;
    // TODO
    // this.getWorkflowExecutionStatistics();
  }
  get namespace(): string {
    return this._namespace;
  }

  hasWorkspaces?: boolean;

  constructor() { }

  ngOnInit() {
    // this.getWorkflowExecutionStatistics();
    // this.workflowsStatisticsInterval = setInterval(() => {
    //   this.getWorkflowExecutionStatistics();
    // }, 5000);
  }

  ngOnDestroy() {
    // if (this.workflowsStatisticsInterval) {
    //   clearInterval(this.workflowsStatisticsInterval);
    //   this.workflowsStatisticsInterval = undefined;
    // }
  }

  // setPhase(phase: WorkflowExecutionPhase) {
  //   this.workflowExecutionPhase = phase;
  // }

  clearPhase(e?: MouseEvent) {
    if (e) {
      e.preventDefault();
      e.stopPropagation(); // Stop propagation so we don't trigger a setPhase event
    }

    // TODO
    // this.workflowExecutionPhase = undefined;
  }

  onWorkspacesChanged(res: WorkspacesChangedEvent) {
    this.hasWorkspaces = res.hasWorkspaces;
  }
}
