import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-workspace-phase-icon',
  templateUrl: './workspace-phase-icon.component.html',
  styleUrls: ['./workspace-phase-icon.component.scss']
})
export class WorkspacePhaseIconComponent implements OnInit {
  @Input() phase: string;

  constructor() { }

  ngOnInit() {
  }

}
