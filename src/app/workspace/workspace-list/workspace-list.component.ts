import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Sort } from '@angular/material';
import { SortDirection } from '@angular/material/typings/sort';
import { Permissions } from '../../auth/models';
import { AuthServiceService, Workspace } from '../../../api';
import { combineLatest } from 'rxjs';
import { map } from 'rxjs/operators';

type WorkspaceAction = 'pause' | 'resume' | 'delete' | 'retry-last-action';

export interface WorkspaceEvent {
  action: WorkspaceAction;
  workspace: Workspace;
}

@Component({
  selector: 'app-workspace-list',
  templateUrl: './workspace-list.component.html',
  styleUrls: ['./workspace-list.component.scss']
})
export class WorkspaceListComponent implements OnInit {
  @Input() namespace: string;
  @Input() sort = 'createdAt';
  @Input() sortDirection: SortDirection = 'desc';
  @Input() workspaces: Workspace[] = [];
  @Input() displayedColumns = ['name', 'status', 'template', 'createdAt', 'timestamp-status', 'spacer', 'actions', 'labels'];
  @Output() sortChange = new EventEmitter<Sort>();
  @Output() workspaceAction = new EventEmitter<WorkspaceEvent>();

  /**
   * workspacePermissions keeps track of which permissions the currently logged in user has for each
   * workspace.
   *
   * Right now, when the menu is opened, a network request is made (if we don't already have data),
   * to get these permissions.
   */
  workspacePermissions = new Map<string, Permissions>();

  constructor(
      private authService: AuthServiceService,
  ) { }

  ngOnInit() {
  }

  sortData(event: Sort) {
    this.sort = event.active;
    this.sortDirection = event.direction;

    this.sortChange.emit(event);
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

  onRetryLastAction(workspace: Workspace) {
    this.workspaceAction.emit({
      action: 'retry-last-action',
      workspace
    });
  }

  onPause(workspace: Workspace) {
    this.workspaceAction.emit({
      action: 'pause',
      workspace
    });
  }

  onResume(workspace: Workspace) {
    this.workspaceAction.emit({
      action: 'resume',
      workspace
    });
  }

  onDelete(workspace: Workspace) {
    this.workspaceAction.emit({
      action: 'delete',
      workspace
    });
  }
}
