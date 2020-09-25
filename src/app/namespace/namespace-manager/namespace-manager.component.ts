import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { NamespaceServiceService } from '../../../api';
import { FormControl } from '@angular/forms';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { Pagination } from '../../requests/pagination';

@Component({
    selector: 'app-namespace-manager',
    templateUrl: './namespace-manager.component.html',
    styleUrls: ['./namespace-manager.component.scss']
})
export class NamespaceManagerComponent implements OnInit {
    @Output() namespaceSelected = new EventEmitter<string>();
    @Output() newNamespaceClick = new EventEmitter();

    queryInput: FormControl;
    pagination = new Pagination();

    namespaces = [];

    constructor(private namespaceServiceService: NamespaceServiceService) {
    }

    ngOnInit() {
        this.queryInput = new FormControl('');
        this.queryInput.valueChanges.pipe(
            debounceTime(400),
            distinctUntilChanged(),
        )
            .subscribe(res => {
                this.getNamespaces();
            });

        this.getNamespaces();
    }

    getNamespaces() {
        const query = this.queryInput.value;
        const pageSize = this.pagination.pageSize;
        const page = this.pagination.page + 1;

        this.namespaceServiceService.listNamespaces(pageSize, page, query)
            .subscribe(res => {
                if (!res.namespaces) {
                    this.namespaces = [];
                } else {
                    this.namespaces = res.namespaces;
                }
            });
    }

    onNamespaceClick(namespace: string) {
        this.namespaceSelected.emit(namespace);
    }

    onNewNamespaceClick() {
        this.newNamespaceClick.emit();
    }
}
