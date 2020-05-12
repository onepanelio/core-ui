import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from "@angular/router";
import { Workspace, WorkspaceServiceService } from "../../../api";
import { DomSanitizer, SafeResourceUrl } from "@angular/platform-browser";

type WorkspaceState = 'Starting' | 'Paused' | 'Resuming' | 'Running';

@Component({
  selector: 'app-workspace-view',
  templateUrl: './workspace-view.component.html',
  styleUrls: ['./workspace-view.component.scss']
})
export class WorkspaceViewComponent implements OnInit, OnDestroy {

  namespace: string;
  workspaceUid: string;
  workspace: Workspace;
  workspaceUrl: SafeResourceUrl;
  workspaceChecker: number;
  state: WorkspaceState;

  constructor(
      private activatedRoute: ActivatedRoute,
      private domSanitizer: DomSanitizer,
      private workspaceService: WorkspaceServiceService,
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

  onResume(workspace: Workspace) {
    this.state = 'Resuming';
    this.workspaceService.resumeWorkspace(this.namespace, workspace.uid)
        .subscribe(res => {
          this.startWorkspaceChecker(true);
        })
  }
}
