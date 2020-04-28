import { Component, OnInit } from '@angular/core';
import { WorkflowTemplateBase, WorkflowTemplateService } from "../workflow-template/workflow-template.service";
import { ActivatedRoute } from "@angular/router";

@Component({
  selector: 'app-workspace',
  templateUrl: './workspace.component.html',
  styleUrls: ['./workspace.component.scss']
})
export class WorkspaceComponent implements OnInit {

  namespace: string;

  displayedColumns = ['name', 'createdAt', 'spacer', 'actions'];

  workflowTemplates: WorkflowTemplateBase[] = [];

  constructor(
      private activatedRoute: ActivatedRoute,
  ) { }

  ngOnInit() {
    this.activatedRoute.paramMap.subscribe(next => {
      this.namespace = next.get('namespace');
    });
  }

}
