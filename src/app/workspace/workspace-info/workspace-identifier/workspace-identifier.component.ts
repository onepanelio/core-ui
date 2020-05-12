import { Component, Input, OnInit } from '@angular/core';
import { Workspace } from "../../../../api";

@Component({
  selector: 'app-workspace-identifier',
  templateUrl: './workspace-identifier.component.html',
  styleUrls: ['./workspace-identifier.component.scss']
})
export class WorkspaceIdentifierComponent implements OnInit {
  @Input() workspace: Workspace;

  constructor() { }

  ngOnInit() {
  }
}
