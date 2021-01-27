import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Permissions } from '../../auth/models';
import { Secret } from '../secrets.component';

@Component({
    selector: 'app-secret-list',
    templateUrl: './secret-list.component.html',
    styleUrls: ['./secret-list.component.scss']
})
export class SecretListComponent {
    @Input() namespace: string;
    @Input() secrets = Array<Secret>();
    @Input() permissions = new Permissions();

    @Output() secretDeletedRequest = new EventEmitter<string>();

    displayedColumns = ['key', 'value', 'actions'];
    secretShown = new Map<string, boolean>();

    isSecretShown(key: string) {
        // Value may be undefined, so we use !! to convert that to boolean.
        return !!this.secretShown.get(key);
    }

    showSecret(key: string) {
        this.secretShown.set(key, true);
    }

    hideSecret(key: string) {
        this.secretShown.set(key, false);
    }

    deleteSecret(key: string) {
        this.secretDeletedRequest.emit(key);
    }
}
