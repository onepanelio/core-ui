import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ListWorkspaceResponse, Workspace, WorkspaceServiceService } from '../../../api';
import { ConfirmationDialogComponent, ConfirmationDialogData } from '../../confirmation-dialog/confirmation-dialog.component';
import { PageEvent } from '@angular/material/paginator';
import { MatDialog } from '@angular/material/dialog';
import { Sort } from '@angular/material';
import { WorkflowExecutionPhase } from '../../workflow/workflow-executions/workflow-executions.component';
import { WorkspaceEvent, WorkspacePhase } from '../workspace-list/workspace-list.component';

type WorkspaceState = 'initialization' | 'new' | 'loading';

export interface WorkspacesChangedEvent {
  response: ListWorkspaceResponse;
  hasWorkspaces: boolean;
}

@Component({
  selector: 'app-workspaces',
  templateUrl: './workspaces.component.html',
  styleUrls: ['./workspaces.component.scss']
})
export class WorkspacesComponent implements OnInit, OnDestroy {
  @Input() namespace: string;
  @Input() page = 0;
  @Input() pageSize = 15;
  @Input() sortOrder = 'createdAt,desc';

  // tslint:disable-next-line:variable-name
  private _phase?: WorkspacePhase;
  @Input() set phase(value: WorkspacePhase) {
    this._phase = value;
    this.page = 0;

    this.getWorkspaces();
  }

  @Output() workspacesChanged = new EventEmitter<WorkspacesChangedEvent>();
  previousSortOrder = '';

  workspaces: Workspace[] = [];
  workspaceResponse: ListWorkspaceResponse;

  /**
   * refers to a setInterval. Used to make requests to update the workspaces.
   */
  workspacesInterval: number;

  /**
   * workspaceUpdatingMap keeps track of which workspaces are being updated, these should not be updated
   * by the regular interval get request.
   *
   * When we perform an action on a workspace like pause, resume, terminate, etc,
   * it takes a second for API to update and respond. It is possible that the request does not finish
   * but we do another Get request in that time. So our status change may be pause => running => pause.
   * To prevent this, we mark the workspace as updating, so the Get request should ignore it.
   */
  private workspaceUpdatingMap = new Map<string, Workspace>();

  workspaceState: WorkspaceState = 'initialization';
  hasWorkspaces = false;

  constructor(
      public activatedRoute: ActivatedRoute,
      public workspaceService: WorkspaceServiceService,
      private dialog: MatDialog) { }

  ngOnInit() {
    this.activatedRoute.paramMap.subscribe(next => {
      this.getWorkspaces();
      this.workspacesInterval = setInterval(() => {
        this.getWorkspaces();
      }, 5000);
    });
  }

  ngOnDestroy() {
    if (this.workspacesInterval) {
      clearInterval(this.workspacesInterval);
      this.workspacesInterval = null;
    }
  }


  /**
   * Marks the workspace as updating.
   */
  private markWorkspaceUpdating(workspace: Workspace) {
    this.workspaceUpdatingMap.set(workspace.uid, workspace);
  }

  /**
   * Marks the workspace as done updating.
   */
  private markWorkspaceDoneUpdating(workspace: Workspace) {
    this.workspaceUpdatingMap.delete(workspace.uid);
  }

  /**
   * @return true if the workspace is updating, false otherwise.
   */
  private isWorkspaceUpdating(workspace: Workspace): boolean {
    return this.workspaceUpdatingMap.has(workspace.uid);
  }

  /**
   * Update the current workspaces list with a new one.
   *
   * This will replace the workspaces if they are completely different, or
   * it will update the workspace objects data if they are only different by data.
   *
   * This prevents UI issues where the entire list refreshes, which can remove any open menus
   * like the workspace action menu.
   */
  private updateWorkspaceList(workspaces: Workspace[]) {
    // If the lengths are different, we have new workspaces or deleted workspaces,
    // so just update the entire list.
    if ((this.workspaces.length !== workspaces.length) ||
        (this.previousSortOrder !== this.sortOrder)) {
      this.workspaces = workspaces;
      return;
    }

    const workspaceMap = new Map<string, Workspace>();
    for (const workspace of this.workspaces) {
      workspaceMap.set(workspace.uid, workspace);
    }

    for (const workspace of workspaces) {
      const existingWorkspace = workspaceMap.get(workspace.uid);

      // If the workspace isn't in our existing ones, we need to update the entire list.
      // There are missing or deleted Workspaces.
      if (!existingWorkspace) {
        this.workspaces = workspaces;
        break;
      }

      // Only update the workspace if it isn't already in an updating state.
      if (!this.isWorkspaceUpdating(existingWorkspace)) {
        existingWorkspace.status = workspace.status;
        existingWorkspace.labels = workspace.labels;
      }
    }
  }

  getWorkspaces() {
    this.workspaceService.listWorkspaces(this.namespace, this.pageSize, this.page + 1, this.sortOrder, undefined, this._phase)
        .subscribe(res => {
          this.workspaceResponse = res;
          if (!res.workspaces) {
            res.workspaces = [];
          }

          this.updateWorkspaceList(res.workspaces);
          this.workspaceState = 'new';
          const hasWorkspaces = !(res.page === 1 && !res.workspaces);
          this.hasWorkspaces = hasWorkspaces;

          this.workspacesChanged.emit({
            response: res,
            hasWorkspaces
          });
        }, err => {
          this.workspaceState = 'new';
        });
  }

  onPause(workspace: Workspace) {
    this.markWorkspaceUpdating(workspace);
    workspace.status.phase = 'Pausing';
    this.workspaceService.pauseWorkspace(this.namespace, workspace.uid)
        .subscribe(res => {
          this.markWorkspaceDoneUpdating(workspace);
        }, err => {
          this.markWorkspaceDoneUpdating(workspace);
        });
  }

  onResume(workspace: Workspace) {
    this.markWorkspaceUpdating(workspace);
    workspace.status.phase = 'Launching';
    this.workspaceService.resumeWorkspace(this.namespace, workspace.uid)
        .subscribe(res => {
          this.markWorkspaceDoneUpdating(workspace);
        }, err => {
          this.markWorkspaceDoneUpdating(workspace);
        });
  }

  onDelete(workspace: Workspace) {
    const data: ConfirmationDialogData = {
      title: `Are you sure you want to terminate workspace "${workspace.name}"?`,
      confirmText: 'DELETE',
      type: 'delete',
    };

    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      data
    });

    dialogRef.afterClosed().subscribe(res => {
      if (!res) {
        return;
      }

      this.markWorkspaceUpdating(workspace);
      workspace.status.phase = 'Terminating';
      this.workspaceService.deleteWorkspace(this.namespace, workspace.uid)
          .subscribe(() => {
            this.markWorkspaceDoneUpdating(workspace);
          }, err => {
            this.markWorkspaceDoneUpdating(workspace);
          });
    });
  }

  onRetryLastAction(workspace: Workspace) {
    this.markWorkspaceUpdating(workspace);
    workspace.status.phase = 'Launching';
    this.workspaceService.retryLastWorkspaceAction(this.namespace, workspace.uid)
        .subscribe(res => {
          this.markWorkspaceDoneUpdating(workspace);
        }, err => {
          this.markWorkspaceDoneUpdating(workspace);
        });
  }

  onPageChange(event: PageEvent) {
    this.page = event.pageIndex;
    this.pageSize = event.pageSize;

    this.getWorkspaces();
  }

  sortData(event: Sort) {
    let field = event.active;
    switch(event.active) {
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

    this.getWorkspaces();
  }

  onWorkspaceEvent(event: WorkspaceEvent) {
    const workspace = event.workspace;

    switch (event.action) {
      case 'delete':
        this.onDelete(workspace);
        break;
      case 'pause':
        this.onPause(workspace);
        break;
      case 'resume':
        this.onResume(workspace);
        break;
      case 'retry-last-action':
        this.onRetryLastAction(workspace);
        break;
    }
  }
}
