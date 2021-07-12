import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { ConfigServiceService } from '../../api';
import { ActivatedRoute } from '@angular/router';
import { PermissionService } from '../permissions/permission.service';

@Component({
  selector: 'app-models',
  templateUrl: './models.component.html',
  styleUrls: ['./models.component.scss']
})
export class ModelsComponent implements OnInit {
    static maxCommunicationAttempts = 10;
    private communicationAttempts = 0;

    namespace: string;
    url?: SafeResourceUrl;
    sendingNamespace?: number;

    @ViewChild('model', {static: false}) modelElement: ElementRef;

    constructor(
        private activatedRoute: ActivatedRoute,
        private configService: ConfigServiceService,
        private domSanitizer: DomSanitizer,
        private permissionService: PermissionService) {
    }

    ngOnInit() {
        this.activatedRoute.paramMap.subscribe(next => {
            this.namespace = next.get('namespace');

            this.permissionService.getModelsPermissions(this.namespace, '', 'list')
                .subscribe(() => {
                    this.loadUrl();
                }, () => {
                    this.url = undefined;
                });
        });

        window.addEventListener('message', (event) => {
            if (event.data === this.namespace) {
                clearInterval(this.sendingNamespace);
            }
        }, false);
    }

    private loadUrl() {
        this.configService.getConfig().subscribe(res => {
            const https = res.apiUrl.startsWith('https');
            const protocol = https ? 'https://' : 'http://';
            // // We add a 't' query parameter is so we avoid caching the response.
            const base = `${protocol}serving.${res.domain}`;
            this.url = this.domSanitizer.bypassSecurityTrustResourceUrl(base + '?t=' + Date.now());

            this.sendingNamespace = setInterval(() => {
                if (!this.sendingNamespace) {
                    return;
                }

                if (this.communicationAttempts >= ModelsComponent.maxCommunicationAttempts) {
                    clearInterval(this.sendingNamespace);
                    return;
                }


                const contentWindow = this.modelElement.nativeElement.contentWindow as Window;
                contentWindow.postMessage(this.namespace, '*');

                this.communicationAttempts++;
            }, 250);
        });
    }
}
