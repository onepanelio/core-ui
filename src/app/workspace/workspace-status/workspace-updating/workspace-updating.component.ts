import { Component, Input, OnInit } from '@angular/core';
import { Workspace } from "../../../../api";

@Component({
  selector: 'app-workspace-updating',
  templateUrl: './workspace-updating.component.html',
  styleUrls: ['./workspace-updating.component.scss']
})
export class WorkspaceUpdatingComponent implements OnInit {
  @Input() workspace: Workspace;

  constructor() { }

  ngOnInit() {
  }

}
