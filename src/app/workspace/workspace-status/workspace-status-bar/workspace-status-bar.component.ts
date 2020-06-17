import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { AuthServiceService, Workspace } from "../../../../api";
import { Duration } from "../../../duration/Duration";
import { AuthService } from "../../../auth/auth.service";
import { NamespaceTracker } from "../../../namespace/namespace-tracker.service";

@Component({
  selector: 'app-workspace-status-bar',
  templateUrl: './workspace-status-bar.component.html',
  styleUrls: ['./workspace-status-bar.component.scss']
})
export class WorkspaceStatusBarComponent implements OnInit {
  @Input() workspace: Workspace;
  @Output() pause = new EventEmitter<Workspace>();
  @Output() delete = new EventEmitter<Workspace>();

  canPause = false;
  canDelete = false;

  daysDurationFormatter = Duration.formatDurationToDays;

  constructor(
      private namespaceTracker: NamespaceTracker,
      private authService: AuthServiceService) { }

  ngOnInit() {
    this.authService.isAuthorized({
      namespace: this.namespaceTracker.activeNamespace,
      verb: 'update',
      resource: 'workspaces',
      resourceName: this.workspace.uid,
      group: 'onepanel.io',
    }).subscribe(res => {
      this.canPause = !!res.authorized;
    }, err => {
      this.canPause = false;
    })

    this.authService.isAuthorized({
      namespace: this.namespaceTracker.activeNamespace,
      verb: 'delete',
      resource: 'workspaces',
      resourceName: this.workspace.uid,
      group: 'onepanel.io',
    }).subscribe(res => {
      this.canDelete = !!res.authorized;
    }, err => {
      this.canDelete = false;
    })
  }

  onPause(workspace: Workspace) {
    this.pause.emit(workspace);
  }

  onDelete(workspace: Workspace) {
    this.delete.emit(workspace);
  }
}
