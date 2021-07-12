import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { WorkflowViewComponent } from './workflow/workflow-view/workflow-view.component';
import { WorkflowTemplateComponent } from './workflow-template/workflow-template.component';
import { WorkflowTemplateViewComponent } from './workflow-template/workflow-template-view/workflow-template-view.component';
import { WorkflowTemplateCreateComponent } from './workflow-template/workflow-template-create/workflow-template-create.component';
import { WorkflowTemplateEditComponent } from './workflow-template/workflow-template-edit/workflow-template-edit.component';
import { NamespaceSelectComponent } from './namespace-select/namespace-select.component';
import { SecretsComponent } from './secrets/secrets.component';
import { CreateSecretComponent } from './secrets/create-secret/create-secret.component';
import { EditSecretComponent } from './secrets/edit-secret/edit-secret.component';
import { LoginComponent } from './auth/login/login.component';
import { AuthGuard } from './auth/auth.guard';
import { WorkspaceComponent } from './workspace/workspace.component';
import { WorkspaceTemplateListComponent } from './workspace/workspace-template/workspace-template-list/workspace-template-list.component';
import { WorkspaceTemplateCreateComponent } from './workspace/workspace-template/workspace-template-create/workspace-template-create.component';
import { WorkspaceViewComponent } from './workspace/workspace-view/workspace-view.component';
import { CanDeactivateGuard } from './guards/can-deactivate.guard';
import { ServiceListComponent } from './services/service-list/service-list.component';
import { ServiceViewComponent } from './services/service-view/service-view.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { WorkflowComponent } from './workflow/workflow.component';
import { ErrorComponent } from './error/error.component';
import { ModelsComponent } from './models/models.component';

const routes: Routes = [
  {
    path: 'login',
    component: LoginComponent,
  },
  {
    path: ':namespace/dashboard',
    component: DashboardComponent,
    canActivate: [AuthGuard],
  },
  {
    path: ':namespace/models',
    component: ModelsComponent,
    canActivate: [AuthGuard],
  },
  {
    path: ':namespace/workflows',
    component: WorkflowComponent,
    canActivate: [AuthGuard],
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
    canDeactivate: [CanDeactivateGuard]
  },
  {
    path: ':namespace/workflow-templates/:uid/edit',
    component: WorkflowTemplateEditComponent,
    canActivate: [AuthGuard],
    canDeactivate: [CanDeactivateGuard]
  },
  {
    path: ':namespace/workflow-templates/:uid',
    component: WorkflowTemplateViewComponent,
    canActivate: [AuthGuard],
  },
  {
    path: ':namespace/workflows/:uid',
    component: WorkflowViewComponent,
    canActivate: [AuthGuard],
  },
  {
    path: ':namespace/workspaces',
    component: WorkspaceComponent,
    canActivate: [AuthGuard],
  },
  {
    path: ':namespace/workspaces/:uid',
    component: WorkspaceViewComponent,
    canActivate: [AuthGuard],
  },
  {
    path: ':namespace/workspace-templates',
    component: WorkspaceTemplateListComponent,
    canActivate: [AuthGuard],
    canDeactivate: [CanDeactivateGuard]
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
    path: ':namespace/services',
    component: ServiceListComponent,
    canActivate: [AuthGuard],
  },
  {
    path: ':namespace/services/:name',
    component: ServiceViewComponent,
    canActivate: [AuthGuard],
  },
  {
    path: ':namespace/error/:code',
    component: ErrorComponent,
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
