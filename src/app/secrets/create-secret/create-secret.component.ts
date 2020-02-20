import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from "@angular/router";
import { AbstractControl, FormBuilder, FormGroup, Validators } from "@angular/forms";
import { ApiSecret, SecretServiceService } from "../../../secret-api";
import { AlertService } from "../../alert/alert.service";
import { Alert } from "../../alert/alert";

@Component({
  selector: 'app-create-secret',
  templateUrl: './create-secret.component.html',
  styleUrls: ['./create-secret.component.scss']
})
export class CreateSecretComponent implements OnInit {
  namespace: string = '';
  secretName: string = '';

  form: FormGroup;
  keyName: AbstractControl;
  value: AbstractControl;

  constructor(
      private activatedRoute: ActivatedRoute,
      private formBuilder: FormBuilder,
      private router: Router,
      private secretService: SecretServiceService,
      private alertService: AlertService
  ) { }

  ngOnInit() {
    this.activatedRoute.paramMap.subscribe(next => {
      this.namespace = next.get('namespace');
      this.secretName = next.get('secret-name');
    });

    this.form = this.formBuilder.group({
      keyName: ['', Validators.compose([
        Validators.required,
        Validators.pattern(/^[A-Za-z_-][A-Za-z0-9_-]*$/),
      ])],
      value: ['', Validators.required],
    });

    this.keyName = this.form.get('keyName');
    this.value = this.form.get('value');
  }

  cancel() {
    this.router.navigate(['/', this.namespace, 'secrets']);
  }

  create() {
    const key = this.keyName.value;
    const data: ApiSecret = {
      name: this.secretName,
      data: {
      }
    };

    data.data[key] = this.value.value;

    this.secretService.addSecretKeyValue(data, this.namespace, this.secretName)
        .subscribe(res => {
          this.router.navigate(['/', this.namespace, 'secrets']);
          this.alertService.storeAlert(new Alert({
            message: `Environment variable '${key}' created`,
            type: 'success',
          }))
        }, err => {
          console.error(err);
        })
  }
}
