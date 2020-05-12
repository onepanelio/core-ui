import { Component, Input, OnInit } from '@angular/core';
import { Workspace } from "../../../../api";
import { Duration } from "../../../duration/Duration";

@Component({
  selector: 'app-workspace-status-bar',
  templateUrl: './workspace-status-bar.component.html',
  styleUrls: ['./workspace-status-bar.component.scss']
})
export class WorkspaceStatusBarComponent implements OnInit {
  @Input() workspace: Workspace;

  daysDurationFormatter = Duration.formatDurationToDays;

  constructor() { }

  ngOnInit() {
  }

  onPause(workspace: Workspace) {
    console.log('pause');
  }
}
