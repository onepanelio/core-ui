import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { WorkflowComponent } from './workflow/workflow.component';
import { WorkflowTemplateComponent } from './workflow-template/workflow-template.component';
import { WorkflowTemplateViewComponent } from './workflow-template/workflow-template-view/workflow-template-view.component';
import { WorkflowTemplateCreateComponent } from './workflow-template/workflow-template-create/workflow-template-create.component';
import { WorkflowTemplateEditComponent } from './workflow-template/workflow-template-edit/workflow-template-edit.component';
import { NamespaceSelectComponent } from "./namespace-select/namespace-select.component";
import { SecretsComponent } from "./secrets/secrets.component";
import { CreateSecretComponent } from "./secrets/create-secret/create-secret.component";
import { EditSecretComponent } from "./secrets/edit-secret/edit-secret.component";
import { LoginComponent } from "./auth/login/login.component";
import { AuthGuard } from "./auth/auth.guard";
import { WorkflowTemplateCloneComponent } from "./workflow-template/workflow-template-clone/workflow-template-clone.component";
import { WorkspaceComponent } from "./workspace/workspace.component";
import { WorkspaceTemplateListComponent } from "./workspace/workspace-template-list/workspace-template-list.component";
import { WorkspaceTemplateCreateComponent } from "./workspace/workspace-template-create/workspace-template-create.component";

const routes: Routes = [
  {
    path: 'login',
    component: LoginComponent,
  },
  {
    path: ':namespace/workflow-templates',
    component: WorkflowTemplateComponent,
    canActivate: [AuthGuard],
  },
  {
    path: ':namespace/workflow-templates/create',
    component: WorkflowTemplateCreateComponent,
    canActivate: [AuthGuard],
  },
  {
    path: ':namespace/workflow-templates/:uid/clone',
    component: WorkflowTemplateCloneComponent,
    canActivate: [AuthGuard],
  },
  {
    path: ':namespace/workflow-templates/:uid/edit',
    component: WorkflowTemplateEditComponent,
    canActivate: [AuthGuard],
  },
  {
    path: ':namespace/workflow-templates/:uid',
    component: WorkflowTemplateViewComponent,
    canActivate: [AuthGuard],
  },
  {
    path: ':namespace/workflows/:name',
    component: WorkflowComponent,
    canActivate: [AuthGuard],
  },
  {
    path: ':namespace/workspaces',
    component: WorkspaceComponent,
    canActivate: [AuthGuard],
  },
  {
    path: ':namespace/workspace-templates',
    component: WorkspaceTemplateListComponent,
    canActivate: [AuthGuard],
  },
  {
    path: ':namespace/workspace-templates/create',
    component: WorkspaceTemplateCreateComponent,
    canActivate: [AuthGuard],
  },
  {
    path: ':namespace/secrets',
    component: SecretsComponent,
    canActivate: [AuthGuard],
  },
  {
    path: ':namespace/secrets/:secret-name/create',
    component: CreateSecretComponent,
    canActivate: [AuthGuard],
  },
  {
    path: ':namespace/secrets/:secret-name/:secret-key/edit',
    component: EditSecretComponent,
    canActivate: [AuthGuard],
  },
  {
    path: '**',
    component: NamespaceSelectComponent,
    canActivate: [AuthGuard],
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
