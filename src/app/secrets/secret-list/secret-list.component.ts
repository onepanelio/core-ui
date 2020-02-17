import { Component, Input, OnInit } from '@angular/core';
import { ApiSecret, SecretServiceService } from "../../../secret-api";
import { ActivatedRoute } from "@angular/router";

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
      private secretService: SecretServiceService
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

        }, err => {
          // Alright, keep your secrets...
          console.error(err);
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
}
