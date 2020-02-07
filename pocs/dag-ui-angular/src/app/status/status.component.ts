import { Component, Input, OnInit } from '@angular/core';
import { WorkflowPhase } from "../workflow/workflow.service";

@Component({
    selector: 'app-status',
    templateUrl: './status.component.html',
    styleUrls: ['./status.component.scss'],
})
export class StatusComponent implements OnInit {
    static completeImageSource = '/assets/images/status-icons/completed.svg';
    static failedImageSource = '/assets/images/status-icons/failed.svg';
    static pausedImageSource = '/assets/images/status-icons/paused.svg';
    static runningGreenImageSource = '/assets/images/status-icons/running-green.svg';
    static runningBlueImageSource = '/assets/images/status-icons/running-blue.svg';
    static stoppedImageSource = '/assets/images/status-icons/stopped.svg';
    static notRunImageSource = '/assets/images/status-icons/notrun.svg';

    static statusMap = new Map<WorkflowPhase, string>([
        ['Succeeded', StatusComponent.completeImageSource],
        ['Pending', StatusComponent.notRunImageSource],
        ['Running', StatusComponent.runningBlueImageSource],
        ['Failed', StatusComponent.failedImageSource],
        ['Error', StatusComponent.failedImageSource],
    ]);

    static statusPhraseMap = new Map<WorkflowPhase, string>([
        ['Succeeded', 'Completed'],
        ['Pending', 'Pending'],
        ['Running', 'Running'],
        ['Failed', 'Failed'],
        ['Error', 'Error'],
    ]);

    private _status: string;

    @Input() set phase(value: WorkflowPhase) {
        this._status = StatusComponent.statusPhraseMap.get(value);
        let imageSource = StatusComponent.statusMap.get(value);

        if (!imageSource) {
            imageSource = StatusComponent.notRunImageSource;
        }

        this.imageSource = imageSource;
    };

    get status(): string {
        return this._status;
    }

    imageSource = StatusComponent.notRunImageSource;

    constructor() { }

    ngOnInit() {
    }
}
