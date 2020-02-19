import { Component, OnInit, ViewChild } from '@angular/core';
import 'brace';
import 'brace/mode/yaml';
import 'brace/ext/searchbox';
import { NamespaceTracker } from "./namespace/namespace-tracker.service";
import { ActivatedRoute, NavigationEnd, Router } from "@angular/router";
import { MatSnackBar } from "@angular/material/snack-bar";
import { NamespaceServiceService } from "../namespace-api";
import { filter } from "rxjs/operators";
import { MatSelect } from "@angular/material/select";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
  @ViewChild(MatSelect, {static:false}) matSelect: MatSelect;

  title = 'onepanel-core-ui';
  selectedNamespace: string;
  namespaces = [];
  activeRoute = 'templates';

  constructor(private namespaceTracker: NamespaceTracker,
              private namespaceService: NamespaceServiceService,
              private activatedRoute: ActivatedRoute,
              private router: Router,
              private snackbar: MatSnackBar) {
    this.selectedNamespace = namespaceTracker.activeNamespace;

    // Keep track of the current url so we know what part of the app we are in and highlight it in the
    // nav bar accordingly.
    this.router.events
        .pipe(filter((e) => e instanceof NavigationEnd))
        .subscribe((e: NavigationEnd) => {
          if(e.urlAfterRedirects.indexOf('templates') >= 0) {
            this.activeRoute = 'templates';
          }
          if(e.urlAfterRedirects.indexOf('secrets') >= 0) {
            this.activeRoute = 'secrets';
          }
        });
  }

  ngOnInit(): void {
    this.namespaceService.listNamespaces()
        .subscribe( res => {
          if(!res.count) {
            return;
          }
          this.namespaces = res.namespaces;
        }, err => {
          this.namespaces = [{name: 'default'}];
        }, () => {
          const namespace = this.activatedRoute.snapshot.firstChild.paramMap.get('namespace');

          if(namespace) {
            this.selectedNamespace = namespace;
            this.namespaceTracker.activeNamespace = namespace;
          }
        });
  }


  onNamespaceChange() {
    if (this.namespaceTracker.activeNamespace === this.selectedNamespace) {
      return;
    }

    this.namespaceTracker.activeNamespace = this.selectedNamespace;
    this.snackbar.open(`Switched to namespace '${this.selectedNamespace}'`, 'OK');
    this.router.navigate(['/', this.namespaceTracker.activeNamespace, 'workflow-templates'])
  }

  onFormFieldClick() {
      this.matSelect.open();
  }
}
