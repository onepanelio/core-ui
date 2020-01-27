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
    @Input() workflows: Workflow[] = [];

    constructor(
        private activatedRoute: ActivatedRoute,
        private workflowService: WorkflowService) { }

    ngOnInit() {
    }
}
