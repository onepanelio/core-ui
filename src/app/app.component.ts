import { Component, OnInit, ViewChild } from '@angular/core';
import 'brace';
import 'brace/mode/yaml';
import 'brace/ext/searchbox';
import { NamespaceTracker } from "./namespace/namespace-tracker.service";
import { ActivatedRoute, NavigationEnd, Router } from "@angular/router";
import { MatSnackBar } from "@angular/material/snack-bar";
import { filter } from "rxjs/operators";
import { MatSelect } from "@angular/material/select";
import { Namespace, NamespaceServiceService } from "../api";
import { AuthService } from "./auth/auth.service";
import { environment } from "../environments/environment";
import { MatDialog } from "@angular/material/dialog";
import { CreateNamespaceDialogComponent } from "./namespace/create-namespace-dialog/create-namespace-dialog.component";
import 'hammerjs';

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
  showNamespaceManager = false;
  showNavigationBar = true;

  constructor(public namespaceTracker: NamespaceTracker,
              private authService: AuthService,
              private namespaceService: NamespaceServiceService,
              private activatedRoute: ActivatedRoute,
              private router: Router,
              private dialog: MatDialog,
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
          const url = e.urlAfterRedirects;

          this.showNamespaceManager = false;

          const urlParts = url.split('/');

          for(const urlPart of urlParts) {
            if(urlPart === 'workspace-templates') {
                this.activeRoute = 'workspaces';
                break;
            }
            if(urlPart.indexOf('templates') >= 0 || urlPart.indexOf('workflows') >= 0) {
                this.activeRoute = 'templates';
                break;
            }
            if(urlPart.indexOf('secrets') >= 0) {
                this.activeRoute = 'secrets';
                break;
            }
            if(urlPart.indexOf('workspace') >= 0) {
                this.activeRoute = 'workspaces';
                break;
            }

            if(urlPart.indexOf('models') >= 0) {
                this.activeRoute = 'models';
                break;
            }
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

  onNewNamespace() {
      const dialogRef = this.dialog.open(CreateNamespaceDialogComponent, {
          maxHeight: '100vh',
      });

      dialogRef.afterClosed().subscribe(namespaceName => {
          if(!namespaceName) {
              return;
          }

          let namespaceData: Namespace = {
            name: namespaceName
          };

          this.namespaceService.createNamespace(namespaceData)
              .subscribe(res => {
                this.onNamespaceChange(namespaceName);
                return;
              });
      })
  }

  onNamespaceChange(newNamespace: string) {
    this.showNamespaceManager = false;
    this.namespaceTracker.activeNamespace = newNamespace;

    this.snackbar.open(`Switched to namespace '${this.namespaceTracker.activeNamespace}'`, 'OK');
    this.router.navigate(['/', this.namespaceTracker.activeNamespace, 'workflow-templates'])
  }

  onFormFieldClick() {
      this.showNamespaceManager = !this.showNamespaceManager;
  }

  logout() {
      this.showNamespaceManager = false;
      this.authService.clearTokens();
      this.router.navigate(['/', 'login']);
  }

  onRouterOutletActivate(data) {
    if(data.hideNavigationBar) {
        this.showNavigationBar = false;
    } else {
        this.showNavigationBar = true;
    }
  }
}
