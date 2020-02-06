import { Component, Input, OnInit } from '@angular/core';

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

    static statusMap = {
        'Succeeded': StatusComponent.completeImageSource,
        'succeeded': StatusComponent.completeImageSource,
        'Pending': StatusComponent.notRunImageSource,
        'pending': StatusComponent.notRunImageSource,
        'Running': StatusComponent.runningBlueImageSource,
        'running': StatusComponent.runningBlueImageSource,
        'Failed': StatusComponent.failedImageSource,
        'failed': StatusComponent.failedImageSource,
    };

    static statusPhraseMap = {
        'Succeeded': 'Completed',
        'succeeded': 'Completed',
        'Pending': 'Pending',
        'pending': 'Pending',
        'Running': 'Running',
        'running': 'Running',
        'Failed': 'Failed',
        'failed': 'Failed',
    };

    private _status: string;

    @Input() set status(value: string) {
        this._status = StatusComponent.statusPhraseMap[value];
        let imageSource = StatusComponent.statusMap[value];

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
