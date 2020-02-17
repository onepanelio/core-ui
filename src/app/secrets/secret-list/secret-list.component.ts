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
  secrets: ApiSecret[] = [];

  displayedColumns = ['key', 'value', 'actions'];
  secretShown = new Map<string, boolean>();

  constructor(
      private secretService: SecretServiceService
  ) { }

  ngOnInit() {
    this.getSecrets();
  }

  getSecrets() {
    this.secretService.listSecrets(this.namespace)
        .subscribe(res => {
          if(!res.secrets) {
            return;
          }

          this.secrets = res.secrets;

          console.log(res.secrets);
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
