import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { WorkflowExecutionPhase, WorkflowExecutionsChangedEvent } from '../../workflow/workflow-executions/workflow-executions.component';
import { WorkspacesChangedEvent } from '../../workspace/workspaces/workspaces.component';
import { WorkflowExecutionStatisticReport, WorkspaceServiceService, WorkspaceStatisticReport } from '../../../api';
import { WorkspacePhase } from '../../workspace/workspace-list/workspace-list.component';

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
    this.getWorkspaceStatistics();
  }
  get namespace(): string {
    return this._namespace;
  }

  workspaceStatisticsInterval?: number;
  hasWorkspaces?: boolean;
  stats?: WorkspaceStatisticReport;
  statsTotal = 0.0;
  workspacePhase?: WorkspacePhase;

  constructor(private workspaceService: WorkspaceServiceService) { }

  ngOnInit() {
    this.getWorkspaceStatistics();
    this.workspaceStatisticsInterval = setInterval(() => {
      this.getWorkspaceStatistics();
    }, 5000);
  }

  ngOnDestroy() {
    if (this.workspaceStatisticsInterval) {
      clearInterval(this.workspaceStatisticsInterval);
      this.workspaceStatisticsInterval = undefined;
    }
  }

  setPhase(phase: WorkspacePhase) {
    this.workspacePhase = phase;
  }

  clearPhase(e?: MouseEvent) {
    if (e) {
      e.preventDefault();
      e.stopPropagation(); // Stop propagation so we don't trigger a setPhase event
    }

    this.workspacePhase = undefined;
  }

  onWorkspacesChanged(res: WorkspacesChangedEvent) {
    this.hasWorkspaces = res.hasWorkspaces;
  }

  getWorkspaceStatistics() {
    this.workspaceService.getWorkspaceStatisticsForNamespace(this.namespace).subscribe(res => {
      if (!res.stats || !res.stats.total) {
        return;
      }

      if (!res.stats.failed) {
        res.stats.failed = 0;
      }
      if (!res.stats.failedToLaunch) {
        res.stats.failedToLaunch = 0;
      }
      if (!res.stats.failedToPause) {
        res.stats.failedToPause = 0;
      }
      if (!res.stats.failedToResume) {
        res.stats.failedToResume = 0;
      }
      if (!res.stats.failedToUpdate) {
        res.stats.failedToUpdate = 0;
      }
      if (!res.stats.failedToTerminate) {
          res.stats.failedToTerminate = 0;
      }
      if (!res.stats.launching) {
        res.stats.launching = 0;
      }
      if (!res.stats.paused) {
        res.stats.paused = 0;
      }
      if (!res.stats.pausing) {
        res.stats.pausing = 0;
      }
      if (!res.stats.running) {
        res.stats.running = 0;
      }
      if (!res.stats.updating) {
        res.stats.updating = 0;
      }
      if (!res.stats.launching) {
        res.stats.launching = 0;
      }
      if (!res.stats.failed) {
        res.stats.failed = 0;
      }
      if (!res.stats.terminating) {
        res.stats.terminating = 0;
      }
      if (!res.stats.terminated) {
        res.stats.terminated = 0;
      }

      this.stats = res.stats;

      this.statsTotal = Math.max(this.stats.running, this.stats.terminating, this.stats.failed, this.stats.launching, this.stats.running, this.stats.paused);

      if (this.statsTotal === 0) {
        this.stats = undefined;
      }
    });
  }
}
