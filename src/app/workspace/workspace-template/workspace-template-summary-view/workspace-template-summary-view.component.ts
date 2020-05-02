import { Component, Input, OnInit } from '@angular/core';
import { WorkspaceTemplate } from "../../../../api";

@Component({
  selector: 'app-workspace-template-summary-view',
  templateUrl: './workspace-template-summary-view.component.html',
  styleUrls: ['./workspace-template-summary-view.component.scss']
})
export class WorkspaceTemplateSummaryViewComponent implements OnInit {
  @Input() iconClass = 'fas fa-desktop';
  @Input() template: WorkspaceTemplate;

  constructor() { }

  ngOnInit() {
  }
}
