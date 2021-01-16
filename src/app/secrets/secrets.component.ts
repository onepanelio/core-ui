import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { PermissionService } from '../permissions/permission.service';
import { Permissions } from '../auth/models';
import { AppRouter } from '../router/app-router.service';
import { HttpErrorResponse } from '@angular/common/http';
import { SecretServiceService } from '../../api';
import { Alert } from '../alert/alert';
import { AlertService } from '../alert/alert.service';

export interface Secret {
    name: string;
    value: string;
}

@Component({
    selector: 'app-secrets',
    templateUrl: './secrets.component.html',
    styleUrls: ['./secrets.component.scss']
})
export class SecretsComponent implements OnInit {
    // Currently we only support secrets for 'onepanel-default-env'.
    static secretName = 'onepanel-default-env';

    namespace: string;
    permissions = new Permissions();
    secrets = new Array<Secret>();

    loading = true;

    constructor(
        private alertService: AlertService,
        private activatedRoute: ActivatedRoute,
        private appRouter: AppRouter,
        private permissionsService: PermissionService,
        private secretService: SecretServiceService
    ) {
    }

    ngOnInit() {
        this.activatedRoute.paramMap.subscribe(next => {
            this.namespace = next.get('namespace');
            this.getPermissions();
        });
    }

    getPermissions() {
        this.loading = true;

        this.permissionsService
            .getSecretPermissions(this.namespace, SecretsComponent.secretName, 'create', 'get', 'list', 'update', 'delete')
            .subscribe(res => {
                this.permissions = res;

                if (res.list) {
                    this.getSecrets();
                } else {
                    this.loading = false;
                }
            }, err => {
                this.loading = false;
            });
    }

    getSecrets() {
        this.loading = true;
        this.secretService.getSecret(this.namespace, SecretsComponent.secretName)
            .subscribe(apiSecret => {
                const newSecrets = [];

                // tslint:disable-next-line:forin
                for (const key in apiSecret.data) {
                    newSecrets.push({
                        name: key,
                        value: apiSecret.data[key]
                    });
                }

                this.secrets = newSecrets;
                this.loading = false;
            }, (err: HttpErrorResponse) => {
                // Alright, keep your secrets...
                if (err.status === 404) {
                    this.secretService.createSecret(this.namespace, {name: 'onepanel-default-env'})
                        .subscribe(res => {
                            this.getSecrets();
                        });
                } else {
                    console.error(err);
                }

                this.loading = false;
            });
    }

    deleteSecret(key: string) {
        this.loading = true;
        this.secretService.deleteSecretKey(this.namespace, 'onepanel-default-env', key)
            .subscribe(res => {
                this.getSecrets();
                this.alertService.storeAlert(new Alert({
                    message: `Environment variable '${key}' deleted`,
                    type: 'success',
                }));

                this.loading = false;
            }, err => {
                this.alertService.storeAlert(new Alert({
                    message: `Environment variable ${key} failed to delete`,
                    type: 'danger',
                }));

                this.loading = false;
            });
    }

    createEnvironmentVariable() {
        this.appRouter.navigateToCreateEnvironmentVariable(this.namespace);
    }
}
