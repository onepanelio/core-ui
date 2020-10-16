import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { NamespaceTracker } from '../namespace/namespace-tracker.service';
import { Location } from '@angular/common';
import { Title } from '@angular/platform-browser';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent implements OnInit {
  activeRoute = 'templates';

  @Input() version: string;

  @Input() set activeUrl(value: string) {
    if (value === '') {
      this.activeRoute = 'dashboard';
      return;
    }

    const urlParts = value.split('/');

    for (const urlPart of urlParts) {
      if (urlPart === 'workspace-templates') {
        this.activeRoute = 'workspaces';
        this.title.setTitle('Onepanel - Workspace Templates');
        return;
      }
      if (urlPart.indexOf('workflows') >= 0) {
        this.activeRoute = 'workflows';
        this.title.setTitle('Onepanel - Workflows');
        return;
      }
      if (urlPart.indexOf('workflow-templates') >= 0) {
        this.activeRoute = 'workflows';
        this.title.setTitle('Onepanel - Workflow Templates');
        return;
      }
      if (urlPart.indexOf('secrets') >= 0) {
        this.activeRoute = 'secrets';
        this.title.setTitle('Onepanel - Settings');
        return;
      }
      if (urlPart.indexOf('workspace') >= 0) {
        this.activeRoute = 'workspaces';
        this.title.setTitle('Onepanel - Workspaces');
        return;
      }
      if (urlPart.indexOf('dashboard') >= 0) {
        this.title.setTitle('Onepanel - Dashboard');
        this.activeRoute = 'dashboard';
        return;
      }
    }
  }

  @Output() logout = new EventEmitter();
  @Output() namespaceClick = new EventEmitter();

  constructor(
      public namespaceTracker: NamespaceTracker,
      private location: Location,
      private title: Title) {
  }

  ngOnInit() {

  }

  handleLogOut() {
    this.logout.emit();
  }

  handleNamespaceClick() {
    this.namespaceClick.emit();
  }

  goBack() {
    this.location.back();
  }
}
