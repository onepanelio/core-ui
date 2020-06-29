import { Component, Input, OnInit } from '@angular/core';
import { AuthServiceService, LabelServiceService, Workspace } from "../../../../api";
import { LabelEditDialogComponent } from "../../../labels/label-edit-dialog/label-edit-dialog.component";
import { MatDialog } from "@angular/material/dialog";
import { Permissions } from "../../../auth/models";
import { NamespaceTracker } from "../../../namespace/namespace-tracker.service";
import { combineLatest } from "rxjs";
import { map } from "rxjs/operators";

@Component({
  selector: 'app-workspace-identifier',
  templateUrl: './workspace-identifier.component.html',
  styleUrls: ['./workspace-identifier.component.scss']
})
export class WorkspaceIdentifierComponent implements OnInit {
  @Input() namespace: string;
  @Input() workspace: Workspace;
  loadingLabels = false;

  permission: Permissions = new Permissions();

  constructor(
      private namespaceTracker: NamespaceTracker,
      private authService: AuthServiceService,
      private labelService: LabelServiceService,
      private dialog: MatDialog) { }

  ngOnInit() {
    this.authService.isAuthorized({
      namespace: this.namespace,
      verb: 'update',
      resource: 'workspaces',
      resourceName: this.workspace.uid,
      group: 'onepanel.io',
    }).subscribe(res => {
      this.permission.update = res.authorized;
    })
  }

  onEditLabels() {
    let labelsCopy = [];
    if(this.workspace.labels) {
      labelsCopy = this.workspace.labels.slice();
    }

    const dialogRef = this.dialog.open(LabelEditDialogComponent, {
      width: '500px',
      maxHeight: '100vh',
      data: {
        labels: labelsCopy
      }
    });

    dialogRef.afterClosed().subscribe(data => {
      if(!data) {
        return;
      }

      this.loadingLabels = true;

      this.labelService.replaceLabels(this.namespace, 'workspace', this.workspace.uid, {
        items: data
      }).subscribe(res => {
        this.loadingLabels = false;
        this.workspace.labels = res.labels;
      }, err => {
        this.loadingLabels = false;
      })
    });
  }
}
