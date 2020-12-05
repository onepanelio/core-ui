import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ListWorkspaceResponse, Workspace, WorkspaceServiceService } from '../../../api';
import { ConfirmationDialogComponent, ConfirmationDialogData } from '../../confirmation-dialog/confirmation-dialog.component';
import { PageEvent } from '@angular/material/paginator';
import { MatDialog } from '@angular/material/dialog';
import { Sort } from '@angular/material';
import { WorkspaceEvent, WorkspacePhase } from '../workspace-list/workspace-list.component';
import { FilterChangedEvent } from '../../list-filter/list-filter.component';

type WorkspaceState = 'initialization' | 'new' | 'loading';

export interface WorkspacesChangedEvent {
    response: ListWorkspaceResponse;
    hasAnyWorkspaces: boolean;
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
    previousSortOrder = 'createdAt,desc';

    // tslint:disable-next-line:variable-name
    private _phase?: WorkspacePhase;
    @Input() set phase(value: WorkspacePhase) {
        this._phase = value;
        this.page = 0;

        this.getWorkspaces();
    }

    @Output() workspacesChanged = new EventEmitter<WorkspacesChangedEvent>();

    workspaces?: Workspace[];
    workspaceResponse: ListWorkspaceResponse;

    /**
     * refers to a setInterval. Used to make requests to update the workspaces.
     */
    workspacesInterval: number;

    lastUpdateRequest?: Date;
    lastUpdateRequestFinished?: Date;

    workspaceState: WorkspaceState = 'initialization';
    hasAnyWorkspaces = false;

    private labelFilter?: string;
    private previousListUpdate = (new Date()).getTime();

    constructor(
        public activatedRoute: ActivatedRoute,
        public workspaceService: WorkspaceServiceService,
        private dialog: MatDialog) {
    }

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
        this.lastUpdateRequest = new Date();
    }

    /**
     * Marks the workspace as done updating.
     */
    private markWorkspaceDoneUpdating(workspace: Workspace) {
        this.lastUpdateRequestFinished = new Date();
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
    private updateWorkspaceList(workspaces: Workspace[], timestamp: number) {
        // If we started an action request like 'delete' it may not have finished yet.
        // To make sure our UI is consistent, we discard any requests until the action request finishes.
        if (this.lastUpdateRequest && !this.lastUpdateRequestFinished) {
            return;
        }

        // It is possible that a network request came in late, in which case it has older data.
        // Don't update to older data.
        if (timestamp < this.previousListUpdate) {
            return;
        }

        this.previousListUpdate = timestamp;

        // If the lengths are different, we have new workspaces or deleted workspaces,
        // so just update the entire list.
        if ((this.workspaces === undefined) || (this.workspaces.length !== workspaces.length) ||
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

            existingWorkspace.status = workspace.status;
            existingWorkspace.labels = workspace.labels;
        }
    }

    getWorkspaces() {
        // If we started an action request like 'delete' it may not have finished yet.
        // To make sure our UI is consistent, we discard any requests until the action request finishes.
        if (this.lastUpdateRequest && !this.lastUpdateRequestFinished) {
            return;
        }

        this.lastUpdateRequest = undefined;
        this.lastUpdateRequestFinished = undefined;

        const page = this.page + 1;
        const pageSize = this.pageSize;

        const now = (new Date()).getTime();

        this.workspaceService.listWorkspaces(this.namespace, pageSize, page, this.sortOrder, this.labelFilter, this._phase)
            .subscribe(res => {
                if (page !== (this.page + 1) || this.pageSize !== this.pageSize) {
                    return;
                }

                this.workspaceResponse = res;
                if (!res.workspaces) {
                    res.workspaces = [];
                }

                this.hasAnyWorkspaces = !!(res.totalAvailableCount && res.totalAvailableCount !== 0);

                this.updateWorkspaceList(res.workspaces, now);
                this.workspaceState = 'new';

                this.workspacesChanged.emit({
                    response: res,
                    hasAnyWorkspaces: this.hasAnyWorkspaces,
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
        switch (event.active) {
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

    labelsChanged(event: FilterChangedEvent) {
        this.labelFilter = event.filterString;

        this.getWorkspaces();
    }
}
