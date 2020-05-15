import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Workspace } from "../../../../api";
import { Duration } from "../../../duration/Duration";

@Component({
  selector: 'app-workspace-status-bar',
  templateUrl: './workspace-status-bar.component.html',
  styleUrls: ['./workspace-status-bar.component.scss']
})
export class WorkspaceStatusBarComponent implements OnInit {
  @Input() workspace: Workspace;
  @Output() pause = new EventEmitter<Workspace>();
  @Output() delete = new EventEmitter<Workspace>();

  daysDurationFormatter = Duration.formatDurationToDays;

  constructor() { }

  ngOnInit() {
  }

  onPause(workspace: Workspace) {
    this.pause.emit(workspace);
  }

  onDelete(workspace: Workspace) {
    this.delete.emit(workspace);
  }
}
