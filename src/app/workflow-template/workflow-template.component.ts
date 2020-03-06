import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { WorkflowTemplateBase, WorkflowTemplateService } from "./workflow-template.service";
import { AlertService } from "../alert/alert.service";
import { Alert } from "../alert/alert";

@Component({
  selector: 'app-workflow-template',
  templateUrl: './workflow-template.component.html',
  styleUrls: ['./workflow-template.component.scss'],
  providers: [WorkflowTemplateService]
})
export class WorkflowTemplateComponent implements OnInit {

  namespace: string;

  displayedColumns = ['name', 'createdAt', 'spacer', 'actions'];

  workflowTemplates: WorkflowTemplateBase[] = [];

  constructor(
      private activatedRoute: ActivatedRoute,
      private workflowTemplateService: WorkflowTemplateService,
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
