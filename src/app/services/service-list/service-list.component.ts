import { Component, OnInit } from '@angular/core';
import {
    ListServicesResponse, Service, ServiceServiceService
} from '../../../api';
import { ActivatedRoute } from '@angular/router';
import { PageEvent } from '@angular/material/paginator';
import { Pagination } from '../../requests/pagination';

@Component({
    selector: 'app-service-list',
    templateUrl: './service-list.component.html',
    styleUrls: ['./service-list.component.scss']
})
export class ServiceListComponent implements OnInit {
    namespace: string;
    displayedColumns = ['name', 'spacer', 'actions'];

    listServicesResponse: ListServicesResponse;
    services: Service[];
    loading = true;

    pagination = new Pagination();

    constructor(
        private activatedRoute: ActivatedRoute,
        private serviceService: ServiceServiceService
    ) {
    }

    ngOnInit() {
        this.activatedRoute.paramMap.subscribe(next => {
            this.namespace = next.get('namespace');
            this.getServices();
        });
    }

    getServices() {
        this.serviceService.listServices(this.namespace, this.pagination.pageSize, this.pagination.page + 1)
            .subscribe(res => {
                this.listServicesResponse = res;
                this.services = res.services;
                this.loading = false;
            }, err => {
                this.loading = false;
            });
    }

    onPageChange(event: PageEvent) {
        this.pagination.page = event.pageIndex;
        this.pagination.pageSize = event.pageSize;

        this.getServices();
    }
}
