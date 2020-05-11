import { Component, OnDestroy, OnInit } from '@angular/core';
import { WorkflowTemplateBase, WorkflowTemplateService } from "../workflow-template/workflow-template.service";
import { ActivatedRoute } from "@angular/router";
import { ListWorkspaceResponse, Workspace, WorkspaceServiceService } from "../../api";
import { Pagination } from "../workflow-template/workflow-template-view/workflow-template-view.component";
import { PageEvent } from "@angular/material/paginator";

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
      private activatedRoute: ActivatedRoute,
      private workspaceService: WorkspaceServiceService
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
          console.log(res);
          this.workspaceResponse = res;
          this.workspaces = res.workspaces;
        })
  }

  onPageChange(event: PageEvent) {
    this.pagination.page = event.pageIndex;
    this.pagination.pageSize = event.pageSize;

    this.getWorkspaces();
  }
}
