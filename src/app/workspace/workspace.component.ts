import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import {
  AuthServiceService,
  WorkspaceServiceService
} from '../../api';
import { WorkspaceExecuteDialogComponent } from './workspace-execute-dialog/workspace-execute-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { AppRouter } from '../router/app-router.service';
import { Permissions } from '../auth/models';
import { WorkspacesChangedEvent } from './workspaces/workspaces.component';
import { PermissionService } from '../permissions/permission.service';

type WorkspaceState = 'loading-initial-data' | 'loading' | 'new';

@Component({
  selector: 'app-workspace',
  templateUrl: './workspace.component.html',
  styleUrls: ['./workspace.component.scss']
})
export class WorkspaceComponent implements OnInit, OnDestroy {
  namespace: string;
  state: WorkspaceState = 'loading-initial-data';

  workspacePermissions = new Permissions();
  workspaceTemplatePermissions = new Permissions();

  showWorkspacesCallToAction = false;

  constructor(
      private appRouter: AppRouter,
      private activatedRoute: ActivatedRoute,
      private authService: AuthServiceService,
      private permissionService: PermissionService,
      private workspaceService: WorkspaceServiceService,
      private dialog: MatDialog
  ) {
    this.activatedRoute.paramMap.subscribe(next => {
      this.namespace = next.get('namespace');

      this.checkPermissions(this.namespace);
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

  hasWorkspacesChanged(hasWorkspaces: boolean) {
    this.showWorkspacesCallToAction = !hasWorkspaces;
  }

  private checkPermissions(namespace: string) {
    this.permissionService
        .getWorkspaceTemplatePermissions(namespace, '', 'list')
        .subscribe(res => {
          this.workspaceTemplatePermissions = res;
        });

    this.permissionService
        .getWorkspacePermissions(namespace, '', 'create')
        .subscribe(res => {
          this.workspacePermissions = res;
        });
  }
}
