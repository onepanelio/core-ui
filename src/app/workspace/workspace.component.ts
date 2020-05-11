import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from "@angular/router";
import { CreateWorkspaceBody, ListWorkspaceResponse, Workspace, WorkspaceServiceService } from "../../api";
import { Pagination } from "../workflow-template/workflow-template-view/workflow-template-view.component";
import { PageEvent } from "@angular/material/paginator";
import { WorkspaceExecuteDialogComponent } from "./workspace-execute-dialog/workspace-execute-dialog.component";
import { MatDialog } from "@angular/material/dialog";
import { AppRouter } from "../router/app-router.service";

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
      this.getWorkspaces()
    }, 5000);
  }

  ngOnDestroy() {
    if(this.getWorkspacesInterval) {
      clearInterval(this.getWorkspacesInterval);
    }
  }

  getWorkspaces() {
    this.workspaceService.listWorkspaces(this.namespace, this.pagination.pageSize, this.pagination.page + 1)
        .subscribe(res => {
          this.workspaceResponse = res;
          this.workspaces = res.workspaces;
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
      if (!result) {
        return;
      }

      const workspace: CreateWorkspaceBody = {
        workspaceTemplateUid: result.template.uid,
        parameters: result.parameters,
        labels: result.labels
      };

      this.workspaceService.createWorkspace(this.namespace, workspace)
          .subscribe(res => {
            this.appRouter.navigateToWorkspace(this.namespace, res.name);
          })
    });
  }

  onPause(workspace: Workspace) {
    this.workspaceService.pauseWorkspace(this.namespace, workspace.uid)
        .subscribe(res => {
          // Do nothing
        })
  }

  onDelete(workspace: Workspace) {
    this.workspaceService.deleteWorkspace(this.namespace, workspace.uid)
        .subscribe(res => {
          // Do nothing
        })
  }
}
