import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import {
  CreateWorkflowTemplate,
  WorkflowTemplateBase,
  WorkflowTemplateDetail,
  WorkflowTemplateService
} from '../workflow-template.service';
import { DagComponent } from '../../dag/dag.component';
import { ActivatedRoute, Route, Router } from '@angular/router';
import { fromEvent } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { NodeRenderer } from '../../node/node.service';
import { HttpErrorResponse } from '@angular/common/http';
import { CreateWorkflow, WorkflowService } from "../../workflow/workflow.service";
import { WorkflowTemplateSelected } from "../../workflow-template-select/workflow-template-select.component";
import { MatSnackBar } from "@angular/material/snack-bar";
import { AbstractControl, FormBuilder, FormGroup, Validators } from "@angular/forms";

@Component({
  selector: 'app-workflow-template-create',
  templateUrl: './workflow-template-create.component.html',
  styleUrls: ['./workflow-template-create.component.scss'],
  providers: [WorkflowService, WorkflowTemplateService]
})
export class WorkflowTemplateCreateComponent implements OnInit {
  @ViewChild(DagComponent, {static: false}) dag: DagComponent;

  manifestText: string;
  manifestTextCurrent: string;
  yamlError: string|null = null;

  namespace: string;
  uid: string;

  templateNameInput: AbstractControl;
  form: FormGroup;

  private workflowTemplateDetail: WorkflowTemplateDetail;

  get workflowTemplate(): WorkflowTemplateDetail {
    return this.workflowTemplateDetail;
  }

  set workflowTemplate(value: WorkflowTemplateDetail) {
    if (!this.dag) {
      setTimeout( () => this.workflowTemplate = value, 500);
      return;
    }

    this.workflowTemplateDetail = value;
    const g = NodeRenderer.createGraphFromManifest(value.manifest);
    this.dag.display(g);

    this.manifestText = value.manifest;
    this.manifestTextCurrent = value.manifest;
  }

  constructor(
      private formBuilder: FormBuilder,
      private router: Router,
      private activatedRoute: ActivatedRoute,
      private workflowService: WorkflowService,
      private workflowTemplateService: WorkflowTemplateService,
      private snackBar: MatSnackBar) { }

  ngOnInit() {
    this.form = this.formBuilder.group({
      templateNameInput: [
        '',
        Validators.compose([
          Validators.required,
        ]),
      ]});

    this.templateNameInput = this.form.get('templateNameInput');

    this.activatedRoute.paramMap.subscribe(next => {
      this.namespace = next.get('namespace');
      this.uid = next.get('uid');

      this.getWorkflowTemplate();
    });
  }

  getWorkflowTemplate() {
    this.workflowTemplateService.getWorkflowTemplate(this.namespace, this.uid)
        .subscribe(res => {
          this.workflowTemplate = res;
        });
  }

  onManifestChange(newManifest: string) {
    this.yamlError = null;

    this.manifestTextCurrent = newManifest;

    if(newManifest === '') {
      this.dag.clear();
      return;
    }

    try {
      const g = NodeRenderer.createGraphFromManifest(newManifest);
      this.dag.display(g);
    } catch (e) {
      this.yamlError = 'error';
    }
  }

  save() {
    if (this.yamlError !== null) {
      this.snackBar.open('Unable to update - the definition is not valid YAML', 'OK');
      return;
    }

    const templateName = this.templateNameInput.value;

    if(!templateName) {
      this.snackBar.open('Unable to update - template name is invalid', 'OK');

      return;
    }

    this.workflowTemplateService
        .create(this.namespace, {
          name: templateName,
          manifest: this.manifestTextCurrent,
        })
        .subscribe(res => {
          this.router.navigate(['/', this.namespace, 'workflow-templates', res.uid]);
        });
  }

  cancel() {
    this.router.navigate(['/', this.namespace, 'workflow-templates']);
  }

  onTemplateSelected(template: WorkflowTemplateSelected) {
    this.manifestText = template.manifest;
  }
}
