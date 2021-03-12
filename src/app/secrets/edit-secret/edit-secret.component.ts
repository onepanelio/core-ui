import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Alert } from '../../alert/alert';
import { AlertService } from '../../alert/alert.service';
import { SecretServiceService } from '../../../api';
import { HttpErrorResponse } from '@angular/common/http';
import { AppRouter } from '../../router/app-router.service';

@Component({
    selector: 'app-edit-secret',
    templateUrl: './edit-secret.component.html',
    styleUrls: ['./edit-secret.component.scss']
})
export class EditSecretComponent implements OnInit {
    namespace = '';
    secretName = '';
    secretKey = '';

    form: FormGroup;
    keyName: AbstractControl;
    value: AbstractControl;

    constructor(
        private activatedRoute: ActivatedRoute,
        private formBuilder: FormBuilder,
        private appRouter: AppRouter,
        private secretService: SecretServiceService,
        private alertService: AlertService,
    ) {
    }

    ngOnInit() {
        this.activatedRoute.paramMap.subscribe(next => {
            this.namespace = next.get('namespace');
            this.secretName = next.get('secret-name');
            this.secretKey = next.get('secret-key');

            this.form = this.formBuilder.group({
                keyName: ['', Validators.compose([
                    Validators.required,
                    Validators.pattern(/^[A-Za-z_-][A-Za-z0-9_-]*$/),
                ])],
                value: ['', Validators.required],
            });

            this.keyName = this.form.get('keyName');
            this.keyName.disable();

            this.keyName.setValue(this.secretKey);

            this.value = this.form.get('value');

            this.getSecret();
        });
    }

    getSecret() {
        this.secretService.getSecret(this.namespace, this.secretName)
            .subscribe(apiSecret => {
                if (apiSecret.data[this.secretKey]) {
                    const secretValue = atob(apiSecret.data[this.secretKey]);
                    this.value.setValue(secretValue);
                }
            }, (err: HttpErrorResponse) => {
                const alert = new Alert({
                    type: 'danger',
                    message: 'Unable to get secret'
                });

                if (err.status === 403) {
                    alert.message = 'Unauthorized';
                }

                this.alertService.storeAlert(alert);
            });
    }

    cancel() {
        this.appRouter.navigateToEnvironmentVariables(this.namespace);
    }

    save() {
        const data = {
            name: this.secretName,
            data: {}
        };
        data.data[this.secretKey] = this.value.value;

        this.secretService.updateSecretKeyValue(this.namespace, this.secretName, data)
            .subscribe(res => {
                this.appRouter.navigateToEnvironmentVariables(this.namespace);
                this.alertService.storeAlert(new Alert({
                    message: `Secret '${this.secretKey}' updated`,
                    type: 'success',
                }));
            }, err => {
                const alert = new Alert({
                    type: 'danger',
                    message: 'Unable to update secret'
                });

                if (err.status === 400) {
                    alert.message = err.error.message;
                } else if (err.status === 409) {
                    alert.message = err.error.message;
                } else if (err.status === 403) {
                    alert.message = 'Unauthorized to update secret';
                }

                this.alertService.storeAlert(alert);
            });
    }
}
