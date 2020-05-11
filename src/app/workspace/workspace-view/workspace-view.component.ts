import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from "@angular/router";
import { Workspace, WorkspaceServiceService } from "../../../api";
import { DomSanitizer, SafeResourceUrl } from "@angular/platform-browser";

@Component({
  selector: 'app-workspace-view',
  templateUrl: './workspace-view.component.html',
  styleUrls: ['./workspace-view.component.scss']
})
export class WorkspaceViewComponent implements OnInit {

  namespace: string;
  workspaceUid: string;
  workspace: Workspace;

  workspaceUrl: SafeResourceUrl;

  constructor(
      private activatedRoute: ActivatedRoute,
      private domSanitizer: DomSanitizer,
      private workspaceService: WorkspaceServiceService,
  ) {
    this.activatedRoute.paramMap.subscribe(next => {
      this.namespace = next.get('namespace');
      this.workspaceUid = next.get('uid');

      this.getWorkspace();
    });
  }

  ngOnInit() {
  }

  getWorkspace() {
    this.workspaceService.getWorkspace(this.namespace, this.workspaceUid).subscribe(res => {
      this.workspace = res;

      let url = `https://${res.name}--${this.namespace}.andrey.onepanel.io`;

      this.workspaceUrl = this.domSanitizer.bypassSecurityTrustResourceUrl(url);

      console.log(this.workspaceUrl);
    })
  }
}
