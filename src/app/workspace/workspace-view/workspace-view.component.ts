import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from "@angular/router";
import { Workspace, WorkspaceServiceService } from "../../../api";
import { DomSanitizer, SafeResourceUrl } from "@angular/platform-browser";

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

  constructor(
      private activatedRoute: ActivatedRoute,
      private domSanitizer: DomSanitizer,
      private workspaceService: WorkspaceServiceService,
  ) {
    this.activatedRoute.paramMap.subscribe(next => {
      this.namespace = next.get('namespace');
      this.workspaceUid = next.get('uid');

      this.getWorkspace();

      this.workspaceChecker = setInterval(() => {
        this.getWorkspace()
      }, 5000);
    });
  }

  ngOnInit() {
  }

  ngOnDestroy() {
    this.clearWorkspaceChecker();
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

      if(res.status.phase === 'Running') {
        this.clearWorkspaceChecker();
      }
    })
  }
}
