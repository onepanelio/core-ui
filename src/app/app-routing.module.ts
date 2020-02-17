import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { WorkflowComponent } from './workflow/workflow.component';
import { WorkflowTemplateComponent } from './workflow-template/workflow-template.component';
import { WorkflowTemplateViewComponent } from './workflow-template/workflow-template-view/workflow-template-view.component';
import { WorkflowTemplateCreateComponent } from './workflow-template/workflow-template-create/workflow-template-create.component';
import { WorkflowListComponent } from './workflow/workflow-list/workflow-list.component';
import { WorkflowTemplateEditComponent } from './workflow-template/workflow-template-edit/workflow-template-edit.component';
import { NamespaceSelectComponent } from "./namespace-select/namespace-select.component";
import { SecretsComponent } from "./secrets/secrets.component";
import { CreateSecretComponent } from "./secrets/create-secret/create-secret.component";
import { EditSecretComponent } from "./secrets/edit-secret/edit-secret.component";

const routes: Routes = [
  {
    path: ':namespace/workflow-templates',
    component: WorkflowTemplateComponent
  },
  {
    path: ':namespace/workflow-templates/create',
    component: WorkflowTemplateCreateComponent
  },
  {
    path: ':namespace/workflow-templates/:uid/edit',
    component: WorkflowTemplateEditComponent
  },
  {
    path: ':namespace/workflow-templates/:uid',
    component: WorkflowTemplateViewComponent
  },
  {
    path: ':namespace/workflows',
    component: WorkflowListComponent
  },
  {
    path: ':namespace/workflows/:name',
    component: WorkflowComponent
  },
  {
    path: ':namespace/secrets',
    component: SecretsComponent
  },
  {
    path: ':namespace/secrets/create',
    component: CreateSecretComponent
  },
  {
    path: ':namespace/secrets/:secret-name/edit',
    component: EditSecretComponent
  },
  {
    path: '**',
    component: NamespaceSelectComponent
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
