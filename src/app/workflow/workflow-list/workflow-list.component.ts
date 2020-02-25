import { Component, Input, OnInit } from '@angular/core';
import { Workflow, WorkflowService } from '../workflow.service';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-workflow-list',
  templateUrl: './workflow-list.component.html',
  styleUrls: ['./workflow-list.component.scss'],
  providers: [ WorkflowService ]
})
export class WorkflowListComponent implements OnInit {
  namespace: string;

  workflows: Workflow[] = [];

  constructor(
    private activatedRoute: ActivatedRoute,
    private workflowService: WorkflowService) { }

  ngOnInit() {
    this.activatedRoute.paramMap.subscribe(next => {
      this.namespace = next.get('namespace');
      this.getWorkflows();
    });
  }

  private getWorkflows() {
    const request = {
      namespace: this.namespace
    };

    this.workflowService.listWorkflows(request)
      .subscribe(res => {
        this.workflows = res.workflowExecutions;
      }, err => {
      });
  }
}
