import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Sort } from '@angular/material';
import { SortDirection } from '@angular/material/typings/sort';
import { Permissions } from '../../auth/models';
import { AuthServiceService, Workspace } from '../../../api';
import { PermissionService } from '../../permissions/permission.service';

type WorkspaceAction = 'pause' | 'resume' | 'delete' | 'retry-last-action';

export type WorkspacePhase = 'Launching' | 'Running' | 'Updating' | 'Pausing' | 'Paused' | 'Terminating' | 'Terminated' |
    'Failed to pause' | 'Failed to resume' | 'Failed to launch' | 'Failed to terminate' | 'Failed to update' | 'Failed';

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
        private permissionService: PermissionService
    ) {
    }

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
     */
    onMatMenuOpen(workspace: Workspace) {
        if (this.workspacePermissions.has(workspace.uid)) {
            return;
        }

        this.permissionService.getWorkspacePermissions(this.namespace, workspace.uid, 'update', 'delete')
            .subscribe(res => {
                this.workspacePermissions.set(workspace.uid, res);
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
