import { EventEmitter, Injectable, Output } from "@angular/core";
import { Namespace, NamespaceServiceService } from "../../api";

@Injectable()
export class NamespaceTracker {
    private gettingNamespaces = false;

    activeNamespace: string = 'default';
    namespaces = new Array<Namespace>();

    @Output() namespacesChanged = new EventEmitter();

    constructor(private namespaceService: NamespaceServiceService) {
    }

    hasNamespaces(): boolean {
        return this.namespaces.length !== 0;
    }

    getNamespaces() {
        if(this.gettingNamespaces) {
            return;
        }

        this.gettingNamespaces = true;
        return this.namespaceService.listNamespaces()
            .subscribe(res => {
                if(!res.count) {
                    return;
                }
                this.namespaces = res.namespaces;
                this.namespacesChanged.emit();

                this.gettingNamespaces = false;
            }, () => {
                this.namespaces = [{name: 'default'}];
                this.namespacesChanged.emit();

                this.gettingNamespaces = false;
            })

    }
}
