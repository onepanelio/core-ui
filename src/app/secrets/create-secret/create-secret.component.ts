import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from "@angular/router";
import { AbstractControl, FormBuilder, FormGroup, Validators } from "@angular/forms";
import { ApiSecret, SecretServiceService } from "../../../secret-api";

@Component({
  selector: 'app-create-secret',
  templateUrl: './create-secret.component.html',
  styleUrls: ['./create-secret.component.scss']
})
export class CreateSecretComponent implements OnInit {
  namespace: string = '';

  form: FormGroup;
  keyName: AbstractControl;
  value: AbstractControl;

  constructor(
      private activatedRoute: ActivatedRoute,
      private formBuilder: FormBuilder,
      private router: Router,
      private secretService: SecretServiceService,
  ) { }

  ngOnInit() {
    this.activatedRoute.paramMap.subscribe(next => {
      this.namespace = next.get('namespace');
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
      name: key,
      data: {
        key: this.value.value,
      }
    };

    this.secretService.createSecret(data, this.namespace)
        .subscribe(res => {
          this.router.navigate(['/', this.namespace, 'secrets', key, 'edit']);
        }, err => {
          console.error(err);
        })
  }
}
