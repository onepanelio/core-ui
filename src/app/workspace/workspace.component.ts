import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from "@angular/router";
import { CreateWorkspaceBody, ListWorkspaceResponse, Workspace, WorkspaceServiceService } from "../../api";
import { Pagination } from "../workflow-template/workflow-template-view/workflow-template-view.component";
import { PageEvent } from "@angular/material/paginator";
import { WorkspaceExecuteDialogComponent } from "./workspace-execute-dialog/workspace-execute-dialog.component";
import { MatDialog } from "@angular/material/dialog";
import { AppRouter } from "../router/app-router.service";

type WorkspaceState = 'loading-initial-data' | 'loading' | 'new';

@Component({
  selector: 'app-workspace',
  templateUrl: './workspace.component.html',
  styleUrls: ['./workspace.component.scss']
})
export class WorkspaceComponent implements OnInit, OnDestroy {
  namespace: string;
  displayedColumns = ['name', 'status', 'template', 'spacer', 'actions'];
  workspaceResponse: ListWorkspaceResponse;
  workspaces: Workspace[] = [];
  pagination = new Pagination();
  getWorkspacesInterval: number;
  state: WorkspaceState = 'loading-initial-data';

  constructor(
      private appRouter: AppRouter,
      private activatedRoute: ActivatedRoute,
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
      this.getWorkspaces()
    }, 5000);
  }

  ngOnDestroy() {
    if(this.getWorkspacesInterval) {
      clearInterval(this.getWorkspacesInterval);
      this.getWorkspacesInterval = null;
    }
  }

  getWorkspaces() {
    this.workspaceService.listWorkspaces(this.namespace, this.pagination.pageSize, this.pagination.page + 1)
        .subscribe(res => {
          this.workspaceResponse = res;
          if(res.workspaces) {
            if(this.workspaces.length !== res.workspaces.length) {
              this.workspaces = res.workspaces;
            } else {
              let map = new Map<string, Workspace>();
              for(let workspace of this.workspaces) {
                map.set(workspace.uid, workspace);
              }

              for(let workspace of res.workspaces) {
                let existingWorkspace = map.get(workspace.uid);
                if(existingWorkspace) {
                  existingWorkspace.status = workspace.status;
                  existingWorkspace.labels = workspace.labels;
                } else {
                  this.workspaces = res.workspaces;
                  break;
                }
              }
            }
          }

          this.state = 'new';
        }, err => {
          this.state = 'new';
        })
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
    workspace.status.phase = 'Pausing';
    this.workspaceService.pauseWorkspace(this.namespace, workspace.uid)
        .subscribe(res => {
          // Do nothing
        })
  }

  onResume(workspace: Workspace) {
    workspace.status.phase = 'Launching';
    this.workspaceService.resumeWorkspace(this.namespace, workspace.uid)
        .subscribe(res => {
          // Do nothing
        })
  }

  onDelete(workspace: Workspace) {
    workspace.status.phase = 'Terminating';
    this.workspaceService.deleteWorkspace(this.namespace, workspace.uid)
        .subscribe(res => {
          // Do nothing
        })
  }
}
