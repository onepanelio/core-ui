import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, Validators } from "@angular/forms";
import { KeyValue } from "../../../api";
import { ActivatedRoute } from "@angular/router";

@Component({
  selector: 'app-workspace-template-create',
  templateUrl: './workspace-template-create.component.html',
  styleUrls: ['./workspace-template-create.component.scss']
})
export class WorkspaceTemplateCreateComponent implements OnInit {

  manifest = "";
  templateNameInput: AbstractControl;
  form: FormGroup;
  labels = new Array<KeyValue>();

  constructor(
      private formBuilder: FormBuilder,
      private activatedRoute: ActivatedRoute
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
      // this.namespace = next.get('namespace');
    });
  }

  ngOnInit() {
  }

  cancel() {

  }

  save() {

  }

}
