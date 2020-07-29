import { Component, OnInit } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from "@angular/platform-browser";
import { ServiceServiceService } from "../../../api";
import { ActivatedRoute } from "@angular/router";

@Component({
  selector: 'app-service',
  templateUrl: './service-view.component.html',
  styleUrls: ['./service-view.component.scss']
})
export class ServiceViewComponent implements OnInit {
  hideNavigationBar = false;

  namespace: string;
  serviceName: string;
  url: SafeResourceUrl;

  constructor(
      private activatedRoute: ActivatedRoute,
      private domSanitizer: DomSanitizer,
      private serviceService: ServiceServiceService) { }

  ngOnInit() {
    this.activatedRoute.paramMap.subscribe(next => {
      this.namespace = next.get('namespace');
      this.serviceName = next.get('name');

      this.getService();
    });
  }

  getService() {
    this.serviceService.getService(this.namespace, this.serviceName).subscribe(res => {
      if(!res.url) {
        return;
      }

      this.url = this.domSanitizer.bypassSecurityTrustResourceUrl(res.url + "?t=" + Date.now());
    })
  }
}
