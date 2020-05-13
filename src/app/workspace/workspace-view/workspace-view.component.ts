import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from "@angular/router";
import { Workspace, WorkspaceServiceService } from "../../../api";
import { DomSanitizer, SafeResourceUrl } from "@angular/platform-browser";
import { MatDialog } from "@angular/material/dialog";
import {
  ConfirmationDialogComponent,
  ConfirmationDialogData
} from "../../confirmation-dialog/confirmation-dialog.component";
import { AppRouter } from "../../router/app-router.service";

type WorkspaceState = 'Launching' | 'Pausing' | 'Paused' | 'Resuming' | 'Running' | 'Deleting';

@Component({
  selector: 'app-workspace-view',
  templateUrl: './workspace-view.component.html',
  styleUrls: ['./workspace-view.component.scss']
})
export class WorkspaceViewComponent implements OnInit, OnDestroy {

  hideNavigationBar = true;

  namespace: string;
  workspaceUid: string;
  workspace: Workspace;
  workspaceUrl: SafeResourceUrl;
  workspaceChecker: number;
  state: WorkspaceState;
  showWorkspaceDetails = false;

  constructor(
      private appRouter: AppRouter,
      private activatedRoute: ActivatedRoute,
      private domSanitizer: DomSanitizer,
      private workspaceService: WorkspaceServiceService,
      private dialog: MatDialog,
  ) {
    this.activatedRoute.paramMap.subscribe(next => {
      this.namespace = next.get('namespace');
      this.workspaceUid = next.get('uid');

      this.startWorkspaceChecker(true);
    });
  }

  ngOnInit() {
  }

  ngOnDestroy() {
    this.clearWorkspaceChecker();
  }

  private startWorkspaceChecker(runNow: boolean = true) {
    if(runNow) {
      this.getWorkspace();
    }

    this.workspaceChecker = setInterval(() => {
      this.getWorkspace()
    }, 5000);
  }

  private clearWorkspaceChecker() {
    if(this.workspaceChecker) {
      clearInterval(this.workspaceChecker);
      this.workspaceChecker = null;
    }
  }

  getWorkspace() {
    this.workspaceService.getWorkspace(this.namespace, this.workspaceUid).subscribe(res => {
      this.workspace = res;
      this.workspaceUrl = this.domSanitizer.bypassSecurityTrustResourceUrl(res.url);

      switch(res.status.phase)
      {
        case 'Running':
          this.state = 'Running';
          this.clearWorkspaceChecker();
          break;
        case 'Paused':
          this.state = 'Paused';
          this.clearWorkspaceChecker();
          break;
      }
    })
  }

  onPause(workspace: Workspace) {
    this.state = 'Pausing';
    this.workspaceService.pauseWorkspace(this.namespace, workspace.uid)
        .subscribe(res => {
          this.startWorkspaceChecker(true);
        })
  }

  onDelete(workspace: Workspace) {
    let data: ConfirmationDialogData = {
      title: 'Are you sure you want to delete this workspace?',
      confirmText: 'DELETE',
      type: 'delete'
    }

    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      data: data
    })

    dialogRef.afterClosed().subscribe(result => {
      if(!result) {
        return;
      }

      this.state = 'Deleting';
      this.workspaceService.deleteWorkspace(this.namespace, workspace.uid)
          .subscribe(res => {
            this.appRouter.navigateToWorkspaces(this.namespace);
          })
    })

  }

  onResume(workspace: Workspace) {
    this.state = 'Resuming';
    this.workspaceService.resumeWorkspace(this.namespace, workspace.uid)
        .subscribe(res => {
          this.startWorkspaceChecker(true);
        })
  }

  onToggleWorkspaceDetails() {
    this.showWorkspaceDetails = !this.showWorkspaceDetails;
  }
}
