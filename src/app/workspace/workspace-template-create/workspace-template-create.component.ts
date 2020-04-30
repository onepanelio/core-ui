import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, Validators } from "@angular/forms";
import { KeyValue, WorkspaceTemplateServiceService } from "../../../api";
import { ActivatedRoute } from "@angular/router";
import * as yaml from 'js-yaml';
import { Observable } from "rxjs";
import { fromObservable } from "rxjs/internal/observable/fromObservable";
import { map } from "rxjs/operators";

@Component({
  selector: 'app-workspace-template-create',
  templateUrl: './workspace-template-create.component.html',
  styleUrls: ['./workspace-template-create.component.scss']
})
export class WorkspaceTemplateCreateComponent implements OnInit {

  namespace: string;
  manifest = "";
  templateNameInput: AbstractControl;
  form: FormGroup;
  labels = new Array<KeyValue>();
  apiManifestInterceptor = undefined;

  constructor(
      private formBuilder: FormBuilder,
      private activatedRoute: ActivatedRoute,
      private workspaceTemplateService: WorkspaceTemplateServiceService,
  ) {
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
    });
  }

  ngOnInit() {
    this.apiManifestInterceptor = (newManifest: string) => {
      const body = {
        manifest: newManifest,
      }
      return this.workspaceTemplateService.generateWorkspaceTemplateWorkflowTemplate(this.namespace, 'generated', body)
          .pipe(
            map(res => res.manifest)
          );
    }
  }

  cancel() {

  }

  save() {

  }
}
