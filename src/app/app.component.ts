import { Component, OnInit, ViewChild } from '@angular/core';
import 'brace';
import 'brace/mode/yaml';
import 'brace/mode/xml';
import 'brace/ext/searchbox';
import { NamespaceTracker } from './namespace/namespace-tracker.service';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { filter } from 'rxjs/operators';
import { MatSelect } from '@angular/material/select';
import { NamespaceServiceService, ServiceServiceService } from '../api';
import { AuthService } from './auth/auth.service';
import { environment } from '../environments/environment';
import { MatDialog } from '@angular/material/dialog';
import { CreateNamespaceDialogComponent } from './namespace/create-namespace-dialog/create-namespace-dialog.component';
import 'hammerjs';
import { AppRouter } from './router/app-router.service';
import { PermissionService } from './permissions/permission.service';
import { AlertService } from './alert/alert.service';
import { Alert } from './alert/alert';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
    @ViewChild(MatSelect, {static: false}) matSelect: MatSelect;

    activeUrl = '';
    title = 'onepanel-core-ui';
    activeRoute = 'templates';
    loggingIn = false;
    version = '1.0.0';
    showNamespaceManager = false;
    showNavigationBar = true;
    showModels = false;

    constructor(public namespaceTracker: NamespaceTracker,
                private appRouter: AppRouter,
                private authService: AuthService,
                private namespaceService: NamespaceServiceService,
                private serviceService: ServiceServiceService,
                private permissionService: PermissionService,
                private activatedRoute: ActivatedRoute,
                private router: Router,
                private dialog: MatDialog,
                private snackbar: MatSnackBar,
                private alertService: AlertService) {
        this.version = environment.version;

        this.namespaceTracker.namespacesChanged.subscribe(() => {
            const namespace = this.activatedRoute.snapshot.firstChild.paramMap.get('namespace');

            if (namespace) {
                this.namespaceTracker.activeNamespace = namespace;
                this.checkIfModelsAvailable(namespace);
            }
        });

        this.namespaceTracker.activateNamespaceChanged.subscribe((newNamespace) => {
            this.checkIfModelsAvailable(newNamespace);
        });

        // Keep track of the current url so we know what part of the app we are in and highlight it in the
        // nav bar accordingly.
        this.router.events
            .pipe(filter((e) => e instanceof NavigationEnd))
            .subscribe((e: NavigationEnd) => {
                this.activeUrl = e.urlAfterRedirects;

                this.showNamespaceManager = false;

                this.loggingIn = e.urlAfterRedirects.indexOf('login') >= 0;

                if (!this.loggingIn && !this.namespaceTracker.hasNamespaces()) {
                    this.namespaceTracker.getNamespaces();
                }
            });
    }

    ngOnInit(): void {
        this.namespaceTracker.getNamespaces();
    }

    private checkIfModelsAvailable(namespace: string) {
        this.serviceService.hasService('kfserving-system').subscribe(res => {
            if (res.hasService) {
                this.permissionService.getModelsPermissions(namespace, '', 'list')
                    .subscribe(() => {
                        this.showModels = true;
                    }, () => {
                        this.showModels = false;
                    });
            } else {
                this.showModels = false;
            }
        });
    }

    onNewNamespace() {
        const dialogRef = this.dialog.open(CreateNamespaceDialogComponent, {
            maxHeight: '100vh',
            data: {
                sourceNamespace: this.namespaceTracker.activeNamespace
            }
        });

        dialogRef.afterClosed().subscribe(namespaceName => {
            if (!namespaceName) {
                return;
            }

            this.showNamespaceManager = false;

            this.alertService.storeAlert(new Alert({
                message: `Namespace '${namespaceName}' successfully created`
            }));

            this.namespaceTracker.getNamespaces();
        });
    }

    onNamespaceChange(newNamespace: string) {
        this.showNamespaceManager = false;
        this.namespaceTracker.activeNamespace = newNamespace;

        this.snackbar.open(`Switched to namespace '${this.namespaceTracker.activeNamespace}'`, 'OK');
        this.appRouter.navigateToNamespaceHomepage(this.namespaceTracker.activeNamespace);
    }

    onFormFieldClick() {
        this.showNamespaceManager = !this.showNamespaceManager;
    }

    logout() {
        this.showNamespaceManager = false;
        this.authService.clearTokens();
        localStorage.removeItem('services-visible');
        this.appRouter.navigateToLogin();
    }

    onRouterOutletActivate(data) {
        this.showNavigationBar = !data.hideNavigationBar;
    }
}
