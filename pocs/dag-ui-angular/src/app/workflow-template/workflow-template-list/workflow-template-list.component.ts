import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { WorkflowTemplateBase, WorkflowTemplateService } from '../workflow-template.service';
import { DagComponent } from '../../dag/dag.component';

@Component({
  selector: 'app-workflow-template-list',
  templateUrl: './workflow-template-list.component.html',
  styleUrls: ['./workflow-template-list.component.scss'],
  providers: [ WorkflowTemplateService ]
})
export class WorkflowTemplateListComponent implements OnInit {
  @ViewChild(DagComponent, {static: false}) dag: DagComponent;
  @Input() namespace: string;

  workflowTemplates: WorkflowTemplateBase[] = [];

  constructor(private workflowTemplateService: WorkflowTemplateService) { }

  ngOnInit() {
    if (!this.namespace) {
      return;
    }

    this.getWorkflowTemplates();
  }

  private getWorkflowTemplates() {
    this.workflowTemplateService.listWorkflowTemplates(this.namespace)
      .subscribe(res => {
        this.workflowTemplates = res.workflowTemplates;
      }, err => {
      });
  }
}
