import { Component, OnInit, ViewChild } from '@angular/core';
import 'brace';
import 'brace/mode/yaml';
import 'brace/ext/searchbox';
import { NamespaceTracker } from "./namespace/namespace-tracker.service";
import { ActivatedRoute, NavigationEnd, Router } from "@angular/router";
import { MatSnackBar } from "@angular/material/snack-bar";
import { filter } from "rxjs/operators";
import { MatSelect } from "@angular/material/select";
import { NamespaceServiceService } from "../api";
import { AuthService } from "./auth/auth.service";
import { environment } from "../environments/environment";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
  @ViewChild(MatSelect, {static:false}) matSelect: MatSelect;

  title = 'onepanel-core-ui';
  activeRoute = 'templates';
  loggingIn = false;
  version: string = '1.0.0';

  constructor(public namespaceTracker: NamespaceTracker,
              private authService: AuthService,
              private namespaceService: NamespaceServiceService,
              private activatedRoute: ActivatedRoute,
              private router: Router,
              private snackbar: MatSnackBar) {

      this.version = environment.version;

      this.namespaceTracker.namespacesChanged.subscribe(() => {
          const namespace = this.activatedRoute.snapshot.firstChild.paramMap.get('namespace');

          if(namespace) {
              this.namespaceTracker.activeNamespace = namespace;
          }
      });

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

          this.loggingIn = e.urlAfterRedirects.indexOf('login') >= 0;

          if(!this.loggingIn && !this.namespaceTracker.hasNamespaces()) {
              this.namespaceTracker.getNamespaces();
          }
        });
  }

  ngOnInit(): void {
      this.namespaceTracker.getNamespaces();
  }

  onNamespaceChange() {
    this.snackbar.open(`Switched to namespace '${this.namespaceTracker.activeNamespace}'`, 'OK');
    this.router.navigate(['/', this.namespaceTracker.activeNamespace, 'workflow-templates'])
  }

  onFormFieldClick() {
      this.matSelect.open();
  }

  logout() {
      this.authService.clearTokens();
      this.router.navigate(['/', 'login']);
  }
}
