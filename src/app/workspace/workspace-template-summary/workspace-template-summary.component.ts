import { Component, Input, OnInit } from '@angular/core';
import { WorkspaceTemplate } from "../../../api";

@Component({
  selector: 'app-workspace-template-summary',
  templateUrl: './workspace-template-summary.component.html',
  styleUrls: ['./workspace-template-summary.component.scss']
})
export class WorkspaceTemplateSummaryComponent implements OnInit {
  @Input() workspaceTemplate: WorkspaceTemplate;

  constructor() { }

  ngOnInit() {
  }

}
