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
import { FormsModule } from '@angular/forms';
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
  ],
    imports: [
        BrowserModule,
        AppRoutingModule,
        HttpClientModule,
        BrowserAnimationsModule,
        MatButtonModule,
        MatRadioModule,
        FormsModule,
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
    ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
