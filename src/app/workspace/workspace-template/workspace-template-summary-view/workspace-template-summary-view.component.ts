import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { WorkspaceTemplate } from "../../../../api";

@Component({
  selector: 'app-workspace-template-summary-view',
  templateUrl: './workspace-template-summary-view.component.html',
  styleUrls: ['./workspace-template-summary-view.component.scss']
})
export class WorkspaceTemplateSummaryViewComponent implements OnInit {
  @Input() iconClass = 'fas fa-desktop';
  @Input() template: WorkspaceTemplate;
  @Input() showMenu = true;

  @Output() createWorkspaceClicked = new EventEmitter<WorkspaceTemplate>();

  constructor() { }

  ngOnInit() {
  }

  createWorkspace() {
    this.createWorkspaceClicked.emit(this.template);
  }
}
