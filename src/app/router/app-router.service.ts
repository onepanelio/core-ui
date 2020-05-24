import { Injectable } from '@angular/core';
import { NavigationExtras, Router, UrlTree } from "@angular/router";

@Injectable({
  providedIn: 'root'
})
export class AppRouter {

  constructor(private router: Router) { }

  public navigateToRoot() {
    return this.router.navigate(['/']);
  }

  public navigateToHomePage() {
    return this.router.navigate(['/']);
  }

  public navigateToWorkflowTemplates(namespace: string) {
    return this.router.navigate(['/', namespace, 'workflow-templates']);
  }

  public navigateToWorkflowTemplateView(namespace: string, workflowTemplateUid: string) {
    return this.router.navigate(['/', namespace, 'workflow-templates', workflowTemplateUid]);
  }

  public navigateToWorkflowTemplateClone(namespace: string, workflowTemplateUid: string) {
    return this.router.navigate(['/', namespace, 'workflow-templates', workflowTemplateUid, 'clone']);
  }

  public navigateToWorkflowExecution(namespace: string, name: string) {
    return this.router.navigate(['/', namespace, 'workflows', name]);
  }

  public navigateToWorkspaceTemplates(namespace: string) {
    return this.router.navigate(['/', namespace, 'workspace-templates']);
  }

  public navigateToWorkspaces(namespace: string) {
    return this.router.navigate(['/', namespace, 'workspaces']);
  }

  public navigateToWorkspace(namespace: string, name: string) {
    return this.router.navigate(['/', namespace, 'workspaces', name]);
  }

  public navigateByUrl(url: string|UrlTree, extras?: NavigationExtras) {
    return this.router.navigateByUrl(url, extras);
  }
}
