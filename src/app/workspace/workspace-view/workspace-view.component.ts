import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from "@angular/router";
import { Parameter, UpdateWorkspaceBody, Workspace, WorkspaceServiceService } from "../../../api";
import { DomSanitizer, SafeResourceUrl } from "@angular/platform-browser";
import { MatDialog } from "@angular/material/dialog";
import {
  ConfirmationDialogComponent,
  ConfirmationDialogData
} from "../../confirmation-dialog/confirmation-dialog.component";
import { AppRouter } from "../../router/app-router.service";
import { WorkflowExecuteDialogComponent } from "../../workflow/workflow-execute-dialog/workflow-execute-dialog.component";

export type WorkspaceState = 'Launching' | 'Updating' | 'Pausing' | 'Paused' | 'Resuming' | 'Running' | 'Deleting';

@Component({
  selector: 'app-workspace-view',
  templateUrl: './workspace-view.component.html',
  styleUrls: ['./workspace-view.component.scss']
})
export class WorkspaceViewComponent implements OnInit, OnDestroy {
  buttonBottom = '20px';

  hideNavigationBar = true;

  namespace: string;
  workspaceUid: string;
  workspace: Workspace;
  workspaceUrl: SafeResourceUrl;
  workspaceChecker: number;
  state: WorkspaceState;
  showWorkspaceDetails = false;

  parameters: Array<Parameter> = [];

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
    this.clearWorkspaceChecker();

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
      // t query parameter is so we avoid caching the response.
      this.workspaceUrl = this.domSanitizer.bypassSecurityTrustResourceUrl(res.url + "?t=" + Date.now());

      this.parameters = res.parameters;
      
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
        case 'Updating':
          this.state = 'Updating';
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

    setTimeout(() => {
      const top = document.getElementById("bottom-panel").offsetHeight;
      this.buttonBottom = (top + 20) + 'px';
    }, 1);
  }

  onUpdateWorkspace(parameters: Array<Parameter>) {
    this.state = 'Updating';

    const body: UpdateWorkspaceBody = {
      parameters: parameters,
    };

    this.workspaceService.updateWorkspace(this.namespace, this.workspace.uid, body)
        .subscribe(res => {
          this.startWorkspaceChecker(true);
        })
  }
}
