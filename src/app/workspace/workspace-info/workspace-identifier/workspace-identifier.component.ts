import { Component, Input, OnInit } from '@angular/core';
import { LabelServiceService, Workspace } from "../../../../api";
import { LabelEditDialogComponent } from "../../../labels/label-edit-dialog/label-edit-dialog.component";
import { MatDialog } from "@angular/material/dialog";

@Component({
  selector: 'app-workspace-identifier',
  templateUrl: './workspace-identifier.component.html',
  styleUrls: ['./workspace-identifier.component.scss']
})
export class WorkspaceIdentifierComponent implements OnInit {
  @Input() namespace: string;
  @Input() workspace: Workspace;
  loadingLabels = false;

  constructor(
      private labelService: LabelServiceService,
      private dialog: MatDialog) { }

  ngOnInit() {
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
