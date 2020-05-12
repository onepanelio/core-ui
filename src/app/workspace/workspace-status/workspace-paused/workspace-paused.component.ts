import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Workspace } from "../../../../api";

@Component({
  selector: 'app-workspace-paused',
  templateUrl: './workspace-paused.component.html',
  styleUrls: ['./workspace-paused.component.scss']
})
export class WorkspacePausedComponent implements OnInit {
  @Input() workspace: Workspace;
  @Input() disabled = false;
  @Output() onResume = new EventEmitter<Workspace>();

  constructor() { }

  ngOnInit() {
  }

  onResumeClick() {
    this.onResume.emit(this.workspace);
  }
}
