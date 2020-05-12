import { Component, Input, OnInit } from '@angular/core';
import { Workspace } from "../../../../api";

@Component({
  selector: 'app-workspace-launching',
  templateUrl: './workspace-launching.component.html',
  styleUrls: ['./workspace-launching.component.scss']
})
export class WorkspaceLaunchingComponent implements OnInit {
  @Input() workspace: Workspace;

  constructor() { }

  ngOnInit() {
  }

}
