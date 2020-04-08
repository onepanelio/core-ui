import { Injectable } from '@angular/core';
import { Router } from "@angular/router";

@Injectable({
  providedIn: 'root'
})
export class AppRouter {

  constructor(private router: Router) { }

  public navigateToWorkflowTemplateView(namespace: string, workflowTemplateUid: string) {
    return this.router.navigate(['/', namespace, 'workflow-templates', workflowTemplateUid]);
  }

  public navigateToWorkflowTemplateClone(namespace: string, workflowTemplateUid: string) {
    return this.router.navigate(['/', namespace, 'workflow-templates', workflowTemplateUid, 'clone']);
  }
}
