import { Component, Input, OnInit } from '@angular/core';
import { ApiSecret } from "../../../secret-api";

@Component({
  selector: 'app-secret-value-view',
  templateUrl: './secret-value-view.component.html',
  styleUrls: ['./secret-value-view.component.scss']
})
export class SecretValueViewComponent implements OnInit {
  keyValues = Array<{key: string, value:string}>();

  @Input() set secret(value: ApiSecret) {
    for(let dataName in value.data) {
      this.keyValues.push({
        key: dataName,
        value: atob(value.data[dataName])
      })
    }
  }

  constructor() { }

  ngOnInit() {
  }

}
