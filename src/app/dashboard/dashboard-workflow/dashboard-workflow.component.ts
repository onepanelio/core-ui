import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { GetWorkflowExecutionStatisticsForNamespaceResponse, WorkflowExecutionStatisticReport, WorkflowServiceService } from '../../../api';
import { WorkflowExecutionPhase } from '../../workflow/workflow-executions/workflow-executions.component';

@Component({
  selector: 'app-dashboard-workflow',
  templateUrl: './dashboard-workflow.component.html',
  styleUrls: ['./dashboard-workflow.component.scss']
})
export class DashboardWorkflowComponent implements OnInit, OnDestroy {
  @Input() namespace: string;

  displayedColumns = ['name', 'status' , 'spacer', 'actions'];

  stats?: WorkflowExecutionStatisticReport;
  statsTotal = 0.0;
  workflowExecutionPhase?: WorkflowExecutionPhase;

  /**
   * refers to a setInterval. Used to make requests to update the workflow statistics.
   */
  workflowsStatisticsInterval?: number;

  constructor(private workflowService: WorkflowServiceService) { }

  getWorkflowExecutionStatistics() {
    this.workflowService.getWorkflowExecutionStatisticsForNamespace(this.namespace).subscribe(res => {
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
}
