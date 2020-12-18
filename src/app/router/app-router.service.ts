import { Injectable } from '@angular/core';
import { ActivatedRoute, NavigationEnd, NavigationExtras, Router, UrlTree } from '@angular/router';
import { Location } from '@angular/common';
import { filter } from 'rxjs/operators';

export interface BackLink {
  name: string;
  route: string;
}

@Injectable({
  providedIn: 'root'
})
export class AppRouter {

  /**
   * routerHistory keeps track of the urls visited.
   */
  routerHistory = new Array<string>();

  /**
   * routerHistoryLimit is the maximum number of items to keep in routerHistory.
   */
  readonly routerHistoryLimit = 10;

  constructor(
      private router: Router,
      private location: Location,
      private activatedRoute: ActivatedRoute) {
    this.router.events
        .pipe(filter((e) => e instanceof NavigationEnd))
        .subscribe((e: NavigationEnd) => {
          this.pushRoute(e.urlAfterRedirects);
        });
  }

  private getLastRoute(): string|undefined {
      if (this.routerHistory.length === 0) {
        return undefined;
      }

      return this.routerHistory[this.routerHistory.length - 1];
  }

  /**
   * pushRoute appends a route to the route history and keeps track of bookkeeping like max items allowed.
   */
  private pushRoute(route: string) {
    // format route so we don't store query parameters
    // this way we don't have a back link that takes you to the same page but different query parameters
    const indexOfParam = route.indexOf('?');
    if ( indexOfParam > 0 ) {
      route = route.substring(0, indexOfParam);
    }

    const lastRoute = this.getLastRoute();
    if (route === lastRoute) {
      return;
    }

    this.routerHistory.push(route);

    if (this.routerHistory.length > this.routerHistoryLimit) {
      this.routerHistory.splice(0, 1);
    }
  }

  /**
   * returns false if there is no where to go back to.
   */
  goBack() {
    if (this.routerHistory.length > 0) {
      this.routerHistory.splice(this.routerHistory.length - 1, 1);
    }

    if (this.routerHistory.length === 0) {
      return false;
    }

    this.location.back();

    return true;
  }

  getBackLink(namespace: string, defaultLink: BackLink): BackLink {
    for (let i = this.routerHistory.length - 2; i >= 0; i--) {
      const route = this.routerHistory[i];

      if (route.indexOf(`/${namespace}/workflows/`) > -1) {
        return {
          name: 'Back to workflow execution',
          route,
        };
      }
      if (route.indexOf(`/${namespace}/workflows`) > -1) {
        return {
          name: 'Back to workflows',
          route,
        };
      }
      if (route.indexOf(`/${namespace}/workflow-templates/`) > - 1) {
        return {
          name: 'Back to workflow template details',
          route,
        };
      }
      if (route.indexOf(`/${namespace}/workflow-templates`) > - 1) {
        return {
          name: 'Back to workflow templates',
          route,
        };
      }
      if (route.indexOf(`/${namespace}/dashboard`) > - 1) {
        return {
          name: 'Back to dashboard',
          route,
        };
      }
    }

    if (this.routerHistory.length > 1) {
      return {
        name: 'Go back',
        route: this.routerHistory[this.routerHistory.length - 1]
      };
    }

    return defaultLink;
  }

  public navigate(commands: any[], extras: NavigationExtras ) {
    return this.router.navigate(commands, extras);
  }

  public navigateByUrl(url: string|UrlTree, extras?: NavigationExtras) {
    return this.router.navigateByUrl(url, extras);
  }

  public navigateToRoot() {
    return this.router.navigate(['/']);
  }

  public navigateToHomePage() {
    return this.router.navigate(['/']);
  }

  public navigateToNamespaceHomepage(namespace: string) {
    return this.router.navigate(['/', namespace, 'dashboard']);
  }

  public navigateToWorkflowTemplates(namespace: string) {
    return this.router.navigate(['/', namespace, 'workflow-templates']);
  }

  public navigateToWorkflowTemplateView(namespace: string, workflowTemplateUid: string) {
    return this.router.navigate(['/', namespace, 'workflow-templates', workflowTemplateUid]);
  }

  public navigateToWorkflowTemplateEdit(namespace: string, workflowTemplateUid: string) {
    return this.router.navigate(['/', namespace, 'workflow-templates', workflowTemplateUid, 'edit']);
  }

  public navigateToWorkflowTemplateClone(namespace: string, workflowTemplateUid: string) {
    return this.router.navigate(['/', namespace, 'workflow-templates', workflowTemplateUid, 'clone']);
  }

  public navigateToWorkflowExecution(namespace: string, name: string) {
    return this.router.navigate(['/', namespace, 'workflows', name]);
  }

  public navigateToWorkspaceTemplates(namespace: string, page: number = 0, pageSize: number = 15, templateUid?: string) {
    const queryParams = {
      page,
      pageSize,
      uid: templateUid
    };

    return this.router.navigate(['/', namespace, 'workspace-templates'], {
      queryParams
    });
  }

  public navigateToWorkspaces(namespace: string) {
    return this.router.navigate(['/', namespace, 'workspaces']);
  }

  public navigateToWorkspace(namespace: string, name: string) {
    return this.router.navigate(['/', namespace, 'workspaces', name]);
  }

  public navigateToDashboard(namespace: string) {
    return this.router.navigate(['/', namespace, 'dashboard']);
  }

  public navigateToLogin() {
    return this.router.navigate(['/', 'login']);
  }

  public navigateToSettings(namespace: string) {
    return this.router.navigate(['/', namespace, 'secrets']);
  }

  public navigateToWorkflowsExecutions(namespace: string) {
    return this.router.navigate(['/', namespace, 'workflows']);
  }

  public navigateToError(namespace: string, code: string) {
    return this.router.navigate(['/', namespace, 'error', code]);
  }
}
