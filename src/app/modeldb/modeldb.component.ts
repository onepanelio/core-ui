import { Component, OnInit } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from "@angular/platform-browser";

@Component({
  selector: 'app-modeldb',
  templateUrl: './modeldb.component.html',
  styleUrls: ['./modeldb.component.scss']
})
export class ModeldbComponent implements OnInit {
  hideNavigationBar = false;
  url: SafeResourceUrl;

  constructor(private domSanitizer: DomSanitizer,) { }

  ngOnInit() {
    const url = 'https://modeldb--rush.demo.onepanel.site';
    this.url = this.domSanitizer.bypassSecurityTrustResourceUrl(url + "?t=" + Date.now());
  }
}
