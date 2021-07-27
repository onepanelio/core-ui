import { EventEmitter, Injectable, Output } from '@angular/core';
import { Namespace, NamespaceServiceService } from '../../api';

@Injectable()
export class NamespaceTracker {
    private gettingNamespaces = false;

    // tslint:disable-next-line:variable-name
    private _activeNamespace = 'default';
    get activeNamespace(): string {
        return this._activeNamespace;
    }

    set activeNamespace(value: string) {
        this._activeNamespace = value;

        this.activateNamespaceChanged.emit(value);
    }

    namespaces = new Array<Namespace>();

    @Output() namespacesChanged = new EventEmitter();
    @Output() activateNamespaceChanged = new EventEmitter<string>();

    constructor(private namespaceService: NamespaceServiceService) {
    }

    hasNamespaces(): boolean {
        return this.namespaces.length !== 0;
    }

    getNamespaces() {
        if (this.gettingNamespaces) {
            return;
        }

        this.gettingNamespaces = true;
        return this.namespaceService.listNamespaces()
            .subscribe(res => {
                if (!res.count) {
                    return;
                }
                this.namespaces = res.namespaces;
                this.namespacesChanged.emit();

                this.gettingNamespaces = false;
            }, () => {
                this.namespaces = [{name: 'default'}];
                this.namespacesChanged.emit();

                this.gettingNamespaces = false;
            });
    }
}
