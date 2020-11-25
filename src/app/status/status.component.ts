import { Component, Input, OnInit } from '@angular/core';
import { WorkflowPhase } from '../workflow/workflow.service';

@Component({
    selector: 'app-status',
    templateUrl: './status.component.html',
    styleUrls: ['./status.component.scss'],
})
export class StatusComponent implements OnInit {
    @Input() phase: WorkflowPhase;

    constructor() { }

    ngOnInit() {
    }
}
