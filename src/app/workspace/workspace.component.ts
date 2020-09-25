import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import {
  AuthServiceService,
  ListWorkspaceResponse,
  Workspace,
  WorkspaceServiceService
} from '../../api';
import { PageEvent } from '@angular/material/paginator';
import { WorkspaceExecuteDialogComponent } from './workspace-execute-dialog/workspace-execute-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { AppRouter } from '../router/app-router.service';
import { combineLatest } from 'rxjs';
import { map } from 'rxjs/operators';
import { Permissions } from '../auth/models';
import {
  ConfirmationDialogComponent,
  ConfirmationDialogData
} from '../confirmation-dialog/confirmation-dialog.component';
import { Pagination } from '../requests/pagination';

type WorkspaceState = 'loading-initial-data' | 'loading' | 'new';

@Component({
  selector: 'app-workspace',
  templateUrl: './workspace.component.html',
  styleUrls: ['./workspace.component.scss']
})
export class WorkspaceComponent implements OnInit, OnDestroy {
  namespace: string;
  displayedColumns = ['name', 'status', 'template', 'createdAt', 'timestamp-status', 'spacer', 'actions', 'labels'];
  workspaceResponse: ListWorkspaceResponse;
  workspaces: Workspace[] = [];
  pagination = new Pagination();
  getWorkspacesInterval: number;
  state: WorkspaceState = 'loading-initial-data';

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

  /**
   * workspacePermissions keeps track of which permissions the currently logged in user has for each
   * workspace.
   *
   * Right now, when the menu is opened, a network request is made (if we don't already have data),
   * to get these permissions.
   */
  workspacePermissions = new Map<string, Permissions>();

  constructor(
      private appRouter: AppRouter,
      private activatedRoute: ActivatedRoute,
      private authService: AuthServiceService,
      private workspaceService: WorkspaceServiceService,
      private dialog: MatDialog
  ) {
    this.activatedRoute.paramMap.subscribe(next => {
      this.namespace = next.get('namespace');

      this.getWorkspaces();
    });
  }

  ngOnInit() {
    this.getWorkspacesInterval = setInterval(() => {
      this.state = 'loading';
      this.getWorkspaces();
    }, 5000);
  }

  ngOnDestroy() {
    if (this.getWorkspacesInterval) {
      clearInterval(this.getWorkspacesInterval);
      this.getWorkspacesInterval = null;
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
    if (this.workspaces.length !== workspaces.length) {
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
    this.workspaceService.listWorkspaces(this.namespace, this.pagination.pageSize, this.pagination.page + 1)
        .subscribe(res => {
          this.workspaceResponse = res;
          if (!res.workspaces) {
            res.workspaces = [];
          }

          this.updateWorkspaceList(res.workspaces);

          this.state = 'new';
        }, err => {
          this.state = 'new';
        });
  }

  onPageChange(event: PageEvent) {
    this.pagination.page = event.pageIndex;
    this.pagination.pageSize = event.pageSize;

    this.getWorkspaces();
  }

  createWorkspace() {
    const dialogRef = this.dialog.open(WorkspaceExecuteDialogComponent, {
      width: '60vw',
      maxHeight: '100vh',
      data: {
        namespace: this.namespace,
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (!result  || result === 'close') {
        return;
      }

      this.appRouter.navigateToWorkspaces(this.namespace);
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

  /**
   * onMatMenuOpen happens when the menu is opened for a workspace list item.
   * We get the permissions for the workspace for the current logged in user, if no
   * permissions have been loaded yet.
   *
   */
  onMatMenuOpen(workspace: Workspace) {
    if (this.workspacePermissions.has(workspace.uid)) {
      return;
    }

    const canUpdate$ = this.authService.isAuthorized({
      namespace: this.namespace,
      verb: 'update',
      resource: 'workspaces',
      resourceName: workspace.uid,
      group: 'onepanel.io',
    });

    const canDelete$ = this.authService.isAuthorized({
      namespace: this.namespace,
      verb: 'delete',
      resource: 'workspaces',
      resourceName: workspace.uid,
      group: 'onepanel.io',
    });


    this.workspacePermissions.set(
        workspace.uid,
        new Permissions({
          delete: true,
          update: true,
        })
    );
    combineLatest([canUpdate$, canDelete$])
        .pipe(
            map(([canUpdateVal$, canDeleteVal$]) => ({
              canUpdate: canUpdateVal$,
              canDelete: canDeleteVal$
            }))
        ).subscribe(res => {
          this.workspacePermissions.set(
              workspace.uid,
              new Permissions({
                delete: res.canDelete.authorized,
                update: res.canUpdate.authorized,
              })
          );
        });
  }
}
