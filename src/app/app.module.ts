import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { DagComponent } from './dag/dag.component';
import { NodeComponent } from './node/node.component';
import { WorkflowComponent } from './workflow/workflow.component';
import { NodeInfoComponent } from './node-info/node-info.component';
import { WorkflowTemplateComponent } from './workflow-template/workflow-template.component';
import { WorkflowTemplateListComponent } from './workflow-template/workflow-template-list/workflow-template-list.component';
import { HttpClientModule } from '@angular/common/http';
import { WorkflowTemplateViewComponent } from './workflow-template/workflow-template-view/workflow-template-view.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import {
  MatButtonModule,
  MatExpansionModule,
  MatFormFieldModule,
  MatRadioModule,
  MatSelectModule,
  MatSnackBarModule, MatTabsModule, MatToolbarModule
} from '@angular/material';
import { WorkflowTemplateCreateComponent } from './workflow-template/workflow-template-create/workflow-template-create.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AceEditorModule } from 'ng2-ace-editor';
import { WorkflowNodeInfoComponent } from './workflow/workflow-node-info/workflow-node-info.component';
import { WorkflowListComponent } from './workflow/workflow-list/workflow-list.component';
import { MomentModule } from 'ngx-moment';
import { WorkflowTemplateEditComponent } from './workflow-template/workflow-template-edit/workflow-template-edit.component';
import { NamespaceSelectComponent } from "./namespace-select/namespace-select.component";
import { MatIconModule } from "@angular/material/icon";
import { MatTableModule } from "@angular/material/table";
import { WorkflowExecutionsListComponent } from "./workflow/workflow-executions-list/workflow-executions-list.component";
import { StatusComponent } from "./status/status.component";
import { MatInputModule } from "@angular/material/input";
import { WorkflowTemplateSelectComponent } from './workflow-template-select/workflow-template-select.component';
import { ClockComponent } from './clock/clock.component';
import { ActivityBarComponent } from './activity-bar/activity-bar.component';
import { WorkflowExecuteDialogComponent } from './workflow/workflow-execute-dialog/workflow-execute-dialog.component';
import { MatDialogModule } from "@angular/material/dialog";
import { MatCheckboxModule } from "@angular/material/checkbox";
import { NamespaceTracker } from "./namespace/namespace-tracker.service";
import { LogsComponent } from "./container-logs/logs.component";
import { AlertComponent } from './alert/alert.component';
import { ParameterComponent } from './node-info/parameter/parameter.component';
import { DateComponent } from './date/date.component';
import { CdkTableModule } from "@angular/cdk/table";
import { ClosableSnackComponent } from './closable-snack/closable-snack.component';
import { MatPaginatorModule } from "@angular/material/paginator";
import { PhaseImagePipe } from "./pipes/phase-image/phase-image.pipe";
import { PhaseTranslatePipe } from './pipes/phase-translate/phase-translate.pipe';
import { MetricsComponent } from './node-info/metrics/metrics.component';
import { ApiModule as NamespaceApiModule, BASE_PATH as NAMESPACE_BASE_PATH } from "../namespace-api";
import { ApiModule as SecretApiModule, BASE_PATH as SECRET_BASE_PATH } from "../secret-api";
import { environment } from "../environments/environment";
import { SecretsComponent } from './secrets/secrets.component';
import { SecretListComponent } from './secrets/secret-list/secret-list.component';
import { CreateSecretComponent } from './secrets/create-secret/create-secret.component';
import { EditSecretComponent } from './secrets/edit-secret/edit-secret.component';
import { Base64DecodePipe } from './pipes/base64/base64-decode.pipe';

@NgModule({
  declarations: [
    AppComponent,
    NamespaceSelectComponent,
    DagComponent,
    NodeComponent,
    WorkflowComponent,
    NodeInfoComponent,
    WorkflowTemplateComponent,
    WorkflowTemplateListComponent,
    WorkflowTemplateViewComponent,
    WorkflowTemplateEditComponent,
    WorkflowTemplateCreateComponent,
    WorkflowNodeInfoComponent,
    WorkflowListComponent,
    WorkflowExecutionsListComponent,
    StatusComponent,
    WorkflowTemplateSelectComponent,
    ClockComponent,
    ActivityBarComponent,
    WorkflowExecuteDialogComponent,
    LogsComponent,
    AlertComponent,
    ParameterComponent,
    DateComponent,
    ClosableSnackComponent,
    PhaseImagePipe,
    PhaseTranslatePipe,
    MetricsComponent,
    SecretsComponent,
    SecretListComponent,
    CreateSecretComponent,
    EditSecretComponent,
    Base64DecodePipe
  ],
    entryComponents: [
        WorkflowExecuteDialogComponent,
        ClosableSnackComponent
    ],
    imports: [
        BrowserModule,
        AppRoutingModule,
        HttpClientModule,
        BrowserAnimationsModule,
        MatButtonModule,
        MatRadioModule,
        FormsModule,
        ReactiveFormsModule,
        MatExpansionModule,
        AceEditorModule,
        MomentModule,
        MatFormFieldModule,
        MatSelectModule,
        MatSnackBarModule,
        MatToolbarModule,
        MatTabsModule,
        MatIconModule,
        MatTableModule,
        MatInputModule,
        MatDialogModule,
        MatCheckboxModule,
        CdkTableModule,
        MatPaginatorModule,
        NamespaceApiModule,
        SecretApiModule
    ],
  providers: [NamespaceTracker,
      {provide: NAMESPACE_BASE_PATH, useValue: environment.baseUrl},
      {provide: SECRET_BASE_PATH, useValue: environment.baseUrl},
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
