import { Component, Input, OnInit } from '@angular/core';
import { ApiSecret, SecretServiceService } from "../../../secret-api";
import { ActivatedRoute } from "@angular/router";
import { AlertService } from "../../alert/alert.service";
import { Alert } from "../../alert/alert";
import { HttpErrorResponse } from "@angular/common/http";

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
                this.secretService.createSecret({name: 'onepanel-default-env'}, this.namespace)
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
                  message: `Secret '${key}' deleted`,
                  type: 'success',
              }))
          }, err => {
              this.alertService.storeAlert(new Alert({
                  message: `Secret ${key} failed to delete`,
                  type: 'danger',
              }))
          })
  }
}
