import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { WorkflowExecutionStatisticReport, WorkflowServiceService } from '../../../api';
import { WorkflowExecutionPhase } from '../../workflow/workflow-executions/workflow-executions.component';
import { NamespaceTracker } from '../../namespace/namespace-tracker.service';

@Component({
  selector: 'app-dashboard-workflow',
  templateUrl: './dashboard-workflow.component.html',
  styleUrls: ['./dashboard-workflow.component.scss']
})
export class DashboardWorkflowComponent implements OnInit, OnDestroy {
  // tslint:disable-next-line:variable-name
  _namespace: string;
  @Input() set namespace(value: string|undefined) {
    if (value === undefined) {
      return;
    }

    this._namespace = value;
    this.getWorkflowExecutionStatistics();
  }
  get namespace(): string {
    return this._namespace;
  }

  stats?: WorkflowExecutionStatisticReport;
  statsTotal = 0.0;
  workflowExecutionPhase?: WorkflowExecutionPhase;

  /**
   * refers to a setInterval. Used to make requests to update the workflow statistics.
   */
  workflowsStatisticsInterval?: number;
  hasWorkflowExecutions?: boolean;

  constructor(private workflowService: WorkflowServiceService, private namespaceTracker: NamespaceTracker) { }

  getWorkflowExecutionStatistics() {
    this.workflowService.getWorkflowExecutionStatisticsForNamespace(this.namespace).subscribe(res => {
      if (!res.stats || !res.stats.total) {
        return;
      }

      if (!res.stats.running) {
        res.stats.running = 0;
      }
      if (!res.stats.completed) {
        res.stats.completed = 0;
      }
      if (!res.stats.failed) {
        res.stats.failed = 0;
      }
      if (!res.stats.terminated) {
        res.stats.terminated = 0;
      }

      this.stats = res.stats;

      this.statsTotal = Math.max(this.stats.running, this.stats.completed, this.stats.failed, this.stats.terminated);
    });
  }

  ngOnInit() {
    this.getWorkflowExecutionStatistics();
    this.workflowsStatisticsInterval = setInterval(() => {
      this.getWorkflowExecutionStatistics();
    }, 5000);
  }

  ngOnDestroy() {
    if (this.workflowsStatisticsInterval) {
      clearInterval(this.workflowsStatisticsInterval);
      this.workflowsStatisticsInterval = undefined;
    }
  }

  setPhase(phase: WorkflowExecutionPhase) {
    this.workflowExecutionPhase = phase;
  }

  clearPhase(e?: MouseEvent) {
    if (e) {
      e.preventDefault();
      e.stopPropagation(); // Stop propagation so we don't trigger a setPhase event
    }
    this.workflowExecutionPhase = undefined;
  }

  onHasWorkflowExecutionsChanged(hasExecutions: boolean) {
    this.hasWorkflowExecutions = hasExecutions;
  }
}
