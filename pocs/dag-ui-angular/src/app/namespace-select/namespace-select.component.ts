import { Component, Input, OnInit } from '@angular/core';
import { Router } from "@angular/router";
import { NamespaceService } from "../namespace/namespace.service";
import { MatSnackBar } from "@angular/material/snack-bar";

@Component({
    selector: 'app-namespace-select',
    templateUrl: './namespace-select.component.html',
    styleUrls: ['./namespace-select.component.scss']
})
export class NamespaceSelectComponent implements OnInit {
    constructor(
        private namespaceService: NamespaceService,
        private router: Router,
        private snackbar: MatSnackBar) {
    }

    ngOnInit() {
        this.namespaceService.listNamespaces()
            .subscribe(namespaceResponse => {
                let newNamespace = 'default';
                if (namespaceResponse.count !== 0) {
                    newNamespace = namespaceResponse.namespaces[0].name;
                } else {
                    this.snackbar.open(`Unable to get activate namespace from API. Resorting to 'default'.`, 'OK');
                }

                this.namespaceService.activateNamespace = newNamespace;
                this.onNamespaceSelected(this.namespaceService.activateNamespace);
            });
    }

    onNamespaceSelected(namespace: string) {
        this.router.navigate(['/', namespace, 'workflow-templates']);
    }
}
