import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ListWorkflowTemplatesResponse, WorkflowTemplate, WorkflowTemplateServiceService } from '../../api';
import { PageEvent } from '@angular/material/paginator';
import { Pagination } from '../requests/pagination';
import { FilterChangedEvent } from '../list-filter/list-filter.component';

type WorkflowTemplateState = 'initialization' | 'loading' | 'new';

@Component({
    selector: 'app-workflow-template',
    templateUrl: './workflow-template.component.html',
    styleUrls: ['./workflow-template.component.scss'],
})
export class WorkflowTemplateComponent implements OnInit, OnDestroy {
    namespace: string;

    displayedColumns = ['name', 'lastExecuted', 'status', 'createdAt', 'spacer', 'actions', 'labels'];

    workflowTemplateResponse: ListWorkflowTemplatesResponse;
    workflowTemplates?: WorkflowTemplate[];
    pagination = new Pagination();
    getWorkflowTemplatesInterval;
    state: WorkflowTemplateState = 'initialization';
    private labelFilter?: string;

    hasAnyWorkflowTemplates = false;

    constructor(
        private activatedRoute: ActivatedRoute,
        private workflowTemplateService: WorkflowTemplateServiceService,
    ) {
    }

    ngOnInit() {
        this.activatedRoute.paramMap.subscribe(next => {
            this.namespace = next.get('namespace');
            this.getWorkflowTemplates();

            if (this.getWorkflowTemplatesInterval) {
                clearInterval(this.getWorkflowTemplatesInterval);
                this.getWorkflowTemplatesInterval = null;
            }

            this.getWorkflowTemplatesInterval = setInterval(() => {
                this.state = 'loading';
                this.getWorkflowTemplates();
            }, 5000);
        });
    }

    ngOnDestroy() {
        if (this.getWorkflowTemplatesInterval) {
            clearInterval(this.getWorkflowTemplatesInterval);
            this.getWorkflowTemplatesInterval = null;
        }
    }

    getWorkflowTemplates() {
        this.workflowTemplateService
            .listWorkflowTemplates(this.namespace, this.pagination.pageSize, this.pagination.page + 1, this.labelFilter)
            .subscribe(res => {
                this.workflowTemplateResponse = res;

                if (res.workflowTemplates) {
                    this.workflowTemplates = res.workflowTemplates;
                } else {
                    this.workflowTemplates = [];
                }

                this.hasAnyWorkflowTemplates = !!(res.totalAvailableCount && res.totalAvailableCount !== 0);

                this.state = 'new';
            }, err => {
                this.state = 'new';
            });
    }

    onPageChange(event: PageEvent) {
        this.pagination.page = event.pageIndex;
        this.pagination.pageSize = event.pageSize;

        this.getWorkflowTemplates();
    }

    labelsChanged(event: FilterChangedEvent) {
        this.labelFilter = event.filterString;

        this.getWorkflowTemplates();
    }
}
