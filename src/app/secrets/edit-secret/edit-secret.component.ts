import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, Validators } from "@angular/forms";
import { ActivatedRoute, Router } from "@angular/router";
import { ApiSecret, SecretServiceService } from "../../../secret-api";

@Component({
  selector: 'app-edit-secret',
  templateUrl: './edit-secret.component.html',
  styleUrls: ['./edit-secret.component.scss']
})
export class EditSecretComponent implements OnInit {
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
  ) { }

  ngOnInit() {
    this.activatedRoute.paramMap.subscribe(next => {
      this.namespace = next.get('namespace');
      this.secretName = next.get('secret-name');

      this.form = this.formBuilder.group({
        keyName: ['', Validators.compose([
          Validators.required,
          Validators.pattern(/^[A-Za-z_-][A-Za-z0-9_-]*$/),
        ])],
        value: ['', Validators.required],
      });

      this.keyName = this.form.get('keyName');
      this.keyName.disable();

      this.keyName.setValue(this.secretName);

      this.value = this.form.get('value');

      this.getSecret();
    });
  }

  getSecret() {
    this.secretService.getSecret(this.namespace, this.secretName)
        .subscribe(apiSecret =>{
          if(apiSecret.data[this.secretName]) {
            this.value.setValue(apiSecret.data[this.secretName]);
          }
        })
  }

  cancel() {
    this.router.navigate(['/', this.namespace, 'secrets']);
  }

  save() {
    const key = this.keyName.value;
    const data: ApiSecret = {
      name: key,
      data: {
        key: this.value.value,
      }
    };

    this.secretService.updateSecretKeyValue(this.namespace, this.secretName)
        .subscribe(res => {
          console.log(res);
        }, err => {
          console.error(err);
        })
  }
}
