import { Component, Input, OnInit } from '@angular/core';
import { Workspace } from "../../../api";
import { Duration } from "../../duration/Duration";

@Component({
  selector: 'app-workspace-status',
  templateUrl: './workspace-status.component.html',
  styleUrls: ['./workspace-status.component.scss']
})
export class WorkspaceStatusComponent implements OnInit {

  @Input() workspace: Workspace;

  daysDurationFormatter = Duration.formatDurationToDays;

  constructor() { }

  ngOnInit() {
  }

}
