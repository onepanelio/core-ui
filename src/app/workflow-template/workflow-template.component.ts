import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ListWorkflowTemplatesResponse, WorkflowTemplate, WorkflowTemplateServiceService } from "../../api";
import { Pagination } from "./workflow-template-view/workflow-template-view.component";
import { PageEvent } from "@angular/material/paginator";

@Component({
  selector: 'app-workflow-template',
  templateUrl: './workflow-template.component.html',
  styleUrls: ['./workflow-template.component.scss'],
})
export class WorkflowTemplateComponent implements OnInit {
  namespace: string;

  displayedColumns = ['name', 'lastExecuted','status', 'createdAt', 'actions'];

  workflowTemplateResponse: ListWorkflowTemplatesResponse;
  workflowTemplates: WorkflowTemplate[] = [];
  pagination = new Pagination();
  getWorkflowTemplatesInterval;

  constructor(
      private activatedRoute: ActivatedRoute,
      private workflowTemplateService: WorkflowTemplateServiceService,
  ) { }

  ngOnInit() {
    this.activatedRoute.paramMap.subscribe(next => {
      this.namespace = next.get('namespace');
      this.getWorkflowTemplates();

      if(this.getWorkflowTemplatesInterval) {
        clearInterval(this.getWorkflowTemplatesInterval);
      }

      this.getWorkflowTemplatesInterval = setInterval(() => {
        this.getWorkflowTemplates()
      }, 5000);
    });
  }

  ngOnDestroy() {
    if(this.getWorkflowTemplatesInterval) {
      clearInterval(this.getWorkflowTemplatesInterval);
    }
  }

  getWorkflowTemplates() {
    this.workflowTemplateService.listWorkflowTemplates(this.namespace, this.pagination.pageSize, this.pagination.page + 1)
        .subscribe(res => {
          this.workflowTemplateResponse = res;

          if(res.workflowTemplates) {
            this.workflowTemplates = res.workflowTemplates;
          } else {
            this.workflowTemplates = [];
          }
        })
  }

  onPageChange(event: PageEvent) {
    this.pagination.page = event.pageIndex;
    this.pagination.pageSize = event.pageSize;

    this.getWorkflowTemplates();
  }
}
