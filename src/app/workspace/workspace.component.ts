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
import { WorkspacesChangedEvent } from './workspaces/workspaces.component';

type WorkspaceState = 'loading-initial-data' | 'loading' | 'new';

@Component({
  selector: 'app-workspace',
  templateUrl: './workspace.component.html',
  styleUrls: ['./workspace.component.scss']
})
export class WorkspaceComponent implements OnInit, OnDestroy {
  namespace: string;
  state: WorkspaceState = 'loading-initial-data';
  hasWorkspaces = false;

  /**
   * workspacePermissions keeps track of which permissions the currently logged in user has for each
   * workspace.
   *
   * Right now, when the menu is opened, a network request is made (if we don't already have data),
   * to get these permissions.
   */
  workspacePermissions = new Map<string, Permissions>();

  showWorkspacesCallToAction = false;

  constructor(
      private appRouter: AppRouter,
      private activatedRoute: ActivatedRoute,
      private authService: AuthServiceService,
      private workspaceService: WorkspaceServiceService,
      private dialog: MatDialog
  ) {
    this.activatedRoute.paramMap.subscribe(next => {
      this.namespace = next.get('namespace');

    });
  }

  ngOnInit() {
  }

  ngOnDestroy() {
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

  workspacesChanged(event: WorkspacesChangedEvent) {
    this.showWorkspacesCallToAction = !event.hasWorkspaces;
  }
}
