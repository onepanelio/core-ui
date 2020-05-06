import { Component, OnInit } from '@angular/core';
import { WorkflowTemplateBase, WorkflowTemplateService } from "../workflow-template/workflow-template.service";
import { ActivatedRoute } from "@angular/router";
import { WorkspaceServiceService } from "../../api";
import { Pagination } from "../workflow-template/workflow-template-view/workflow-template-view.component";

@Component({
  selector: 'app-workspace',
  templateUrl: './workspace.component.html',
  styleUrls: ['./workspace.component.scss']
})
export class WorkspaceComponent implements OnInit {

  namespace: string;
  displayedColumns = ['name', 'createdAt', 'spacer', 'actions'];
  workflowTemplates: WorkflowTemplateBase[] = [];
  pagination = new Pagination();

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
  }

  getWorkspaces() {
    this.workspaceService.listWorkspaces(this.namespace, this.pagination.pageSize, this.pagination.page + 1)
        .subscribe(res => {
          console.log(res);
        })
  }
}
