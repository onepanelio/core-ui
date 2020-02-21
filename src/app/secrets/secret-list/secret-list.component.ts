import { Component, Input, OnInit } from '@angular/core';
import { AlertService } from "../../alert/alert.service";
import { Alert } from "../../alert/alert";
import { HttpErrorResponse } from "@angular/common/http";
import { SecretServiceService } from "../../../api";

@Component({
  selector: 'app-secret-list',
  templateUrl: './secret-list.component.html',
  styleUrls: ['./secret-list.component.scss']
})
export class SecretListComponent implements OnInit {
  @Input() namespace: string;
  secrets = Array<{name: string, value: string}>();

  displayedColumns = ['key', 'value', 'actions'];
  secretShown = new Map<string, boolean>();

  constructor(
      private secretService: SecretServiceService,
      private alertService: AlertService,
  ) { }

  ngOnInit() {
    this.getSecrets();
  }

  getSecrets() {
      // Currently we only support secrets for 'onepanel-default-env'.
    this.secretService.getSecret(this.namespace, 'onepanel-default-env')
        .subscribe(apiSecret => {
            let newSecrets = [];

            for(let key in apiSecret.data) {
                newSecrets.push({
                    name: key,
                    value: apiSecret.data[key]
                })
            }

            this.secrets = newSecrets;

        }, (err: HttpErrorResponse) => {
            // Alright, keep your secrets...
            if(err.status === 404) {
                this.secretService.createSecret(this.namespace, {name: 'onepanel-default-env'})
                    .subscribe(res => {
                        this.getSecrets();
                    })
            } else {
                console.error(err);
            }
        })
  }

  isSecretShown(key: string) {
    // Value may be undefined, so we use !! to convert that to boolean.
    return !!this.secretShown.get(key);
  }

  showSecret(key: string) {
      this.secretShown.set(key, true);
  }

  hideSecret(key: string) {
      this.secretShown.set(key, false);
  }

  deleteSecret(key: string) {
      this.secretService.deleteSecretKey(this.namespace, 'onepanel-default-env', key)
          .subscribe(res => {
              this.getSecrets();
              this.alertService.storeAlert(new Alert({
                  message: `Environment variable '${key}' deleted`,
                  type: 'success',
              }))
          }, err => {
              this.alertService.storeAlert(new Alert({
                  message: `Environment variable ${key} failed to delete`,
                  type: 'danger',
              }))
          })
  }
}
