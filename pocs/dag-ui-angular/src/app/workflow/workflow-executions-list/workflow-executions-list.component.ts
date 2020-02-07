import { Component, Input, OnInit } from '@angular/core';
import { Workflow, WorkflowService } from '../workflow.service';
import { ActivatedRoute } from '@angular/router';

@Component({
    selector: 'app-workflow-executions-list',
    templateUrl: './workflow-executions-list.component.html',
    styleUrls: ['./workflow-executions-list.component.scss'],
    providers: [ WorkflowService ]
})
export class WorkflowExecutionsListComponent implements OnInit {
    @Input() namespace: string;
    @Input() set workflows(value: Workflow[]) {
        this.orderedWorkflows = value.sort((a: Workflow, b: Workflow) => {
           const aDate = new Date(a.createdAt);
           const bDate = new Date(b.createdAt);

           return bDate.getTime() - aDate.getTime();
        });
    }

    orderedWorkflows: Workflow[] = [];

    constructor(
        private activatedRoute: ActivatedRoute,
        private workflowService: WorkflowService) { }

    ngOnInit() {
    }
}
