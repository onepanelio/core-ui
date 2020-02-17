import { Component, OnInit } from '@angular/core';
import { Router } from "@angular/router";
import { NamespaceTracker } from "../namespace/namespace-tracker.service";
import { MatSnackBar } from "@angular/material/snack-bar";
import { HttpErrorResponse } from "@angular/common/http";
import { NamespaceServiceService } from "../../namespace-api";

@Component({
    selector: 'app-namespace-select',
    templateUrl: './namespace-select.component.html',
    styleUrls: ['./namespace-select.component.scss']
})
export class NamespaceSelectComponent implements OnInit {
    constructor(
        private namespaceService: NamespaceTracker,
        private namespaceApiService: NamespaceServiceService,
        private router: Router,
        private snackbar: MatSnackBar) {
    }

    ngOnInit() {
        let newNamespace = 'default';

        this.namespaceApiService.listNamespaces()
            .subscribe(namespaceResponse => {
                if (namespaceResponse.count) {
                    newNamespace = namespaceResponse.namespaces[0].name;
                } else {
                    this.snackbar.open(`Unable to get activate namespace from API. Resorting to 'default'.`, 'OK');
                }

                this.namespaceService.activeNamespace = newNamespace;
                this.onNamespaceSelected(this.namespaceService.activeNamespace);
            }, (err: HttpErrorResponse) => {
                let errorMessage = 'Unable to get activate namespace from API.';
                if (err.status === 0) {
                    errorMessage = 'Unable to connect to API. Is it running?'
                }

                this.snackbar.open(`${errorMessage} Resorting to namespace '${newNamespace}'.`, 'OK');
                this.namespaceService.activeNamespace = newNamespace;
                this.onNamespaceSelected(this.namespaceService.activeNamespace);
            });
    }

    onNamespaceSelected(namespace: string) {
        this.router.navigate(['/', namespace, 'workflow-templates']);
    }
}
