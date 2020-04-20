import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { WorkflowTemplate, WorkflowTemplateServiceService } from "../../api";

@Component({
  selector: 'app-workflow-template',
  templateUrl: './workflow-template.component.html',
  styleUrls: ['./workflow-template.component.scss'],
})
export class WorkflowTemplateComponent implements OnInit {
  namespace: string;

  displayedColumns = ['name', 'lastExecuted','status', 'createdAt', 'actions'];

  workflowTemplates: WorkflowTemplate[] = [];

  constructor(
      private activatedRoute: ActivatedRoute,
      private workflowTemplateService: WorkflowTemplateServiceService,
  ) { }

  ngOnInit() {
    this.activatedRoute.paramMap.subscribe(next => {
      this.namespace = next.get('namespace');
      this.getWorkflowTemplates();
    });
  }

  getWorkflowTemplates() {
    this.workflowTemplateService.listWorkflowTemplates(this.namespace)
        .subscribe(res => {
          if(res.workflowTemplates) {
            this.workflowTemplates = res.workflowTemplates;
          } else {
            this.workflowTemplates = [];
          }
        })
  }
}
