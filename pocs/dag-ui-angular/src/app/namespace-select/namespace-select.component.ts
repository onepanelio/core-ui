import { Component, Input, OnInit } from '@angular/core';
import { Router } from "@angular/router";

@Component({
    selector: 'app-namespace-select',
    templateUrl: './namespace-select.component.html',
    styleUrls: ['./namespace-select.component.scss']
})
export class NamespaceSelectComponent implements OnInit {
    constructor(private router: Router) { }

    ngOnInit(
    ) {
    }

    onNamespaceSelected(namespace: string) {
        this.router.navigate(['/', namespace, 'workflow-templates']);
    }
}
