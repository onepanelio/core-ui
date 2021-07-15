import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { ConfigServiceService } from '../../api';
import { ActivatedRoute, Router } from '@angular/router';
import { PermissionService } from '../permissions/permission.service';

type KfservingMessageType = 'confirm-namespace' | 'navigation';

interface KfservingMessage {
    type: KfservingMessageType;
    data: any;
}

@Component({
  selector: 'app-models',
  templateUrl: './models.component.html',
  styleUrls: ['./models.component.scss']
})
export class ModelsComponent implements OnInit {
    static maxCommunicationAttempts = 10;
    private communicationAttempts = 0;

    // baseUrl is the base path to the kfserving service
    private baseUrl?: string;

    // selectedModel is the model the user is currently viewing details about
    private selectedModel?: string;

    // pageUrl is the url of this page
    private pageUrl: string;

    // namespace is the currently active namespace
    namespace: string;

    // url is the final url to load into the iFrame
    url?: SafeResourceUrl;

    // sendingNamespace is a reference to the interval used to communicate the current namespace to the iFrame
    sendingNamespace?: number;

    @ViewChild('model', {static: false}) modelElement: ElementRef;

    constructor(
        private router: Router,
        private activatedRoute: ActivatedRoute,
        private configService: ConfigServiceService,
        private domSanitizer: DomSanitizer,
        private permissionService: PermissionService) {
    }

    ngOnInit() {
        const locationHref = window.location.href;
        const queryParamLocation = locationHref.indexOf('?');
        if (queryParamLocation < 0) {
            this.pageUrl = locationHref;
        } else {
            this.pageUrl = locationHref.substr(0, queryParamLocation);
        }

        this.activatedRoute.paramMap.subscribe(next => {
            this.namespace = next.get('namespace');

            this.permissionService.getModelsPermissions(this.namespace, '', 'list')
                .subscribe(() => {
                    this.loadUrl();
                }, () => {
                    this.url = undefined;
                });
        });

        this.activatedRoute.queryParamMap.subscribe(next => {
           if (next.has('model')) {
               this.loadModelDetail(next.get('model'));
           }
        });

        window.addEventListener('message', (event) => {
            console.log(event);
            const payload = event.data as KfservingMessage;
            if (!payload) {
                return;
            }

            if (payload.type === 'confirm-namespace') {
                if (payload.data === this.namespace) {
                    clearInterval(this.sendingNamespace);
                }
            } else if (payload.type === 'navigation') {
                if (payload.data.page === 'index') {
                    window.history.pushState({}, document.title, this.pageUrl);
                } else if (payload.data.page === 'model-detail') {
                    const modelName = encodeURIComponent(payload.data.model);
                    window.history.pushState({}, document.title, `${this.pageUrl}?model=${modelName}`);
                }
            }
        }, false);
    }

    private loadModelDetail(model: string) {
        this.selectedModel = model;
        if (!this.baseUrl) {
            return;
        }

        this.loadUrl();
    }

    private generateKfservingUrl(): string {
        let url = this.baseUrl;
        if (this.selectedModel) {
            url += `/details/${this.namespace}/${this.selectedModel}`;
        }

        // We add a 't' query parameter is so we avoid caching the response.
        url += `?t=${Date.now()}`;

        return url;
    }

    private loadUrl() {
        // We've already obtained the url from server
        if (this.baseUrl) {
            this.url = this.domSanitizer.bypassSecurityTrustResourceUrl(this.generateKfservingUrl());
            return;
        }

        this.configService.getConfig().subscribe(res => {
            const https = res.apiUrl.startsWith('https');
            const protocol = https ? 'https://' : 'http://';
            this.baseUrl = `${protocol}serving.${res.domain}`;

            this.url = this.domSanitizer.bypassSecurityTrustResourceUrl(this.generateKfservingUrl());

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
            }, 350);
        });
    }
}
