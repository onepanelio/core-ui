import { Component, Input, OnInit } from '@angular/core';

type NormalizedStatus = 'success' | 'progress' | 'failed';

@Component({
  selector: 'app-activity-bar',
  templateUrl: './activity-bar.component.html',
  styleUrls: ['./activity-bar.component.scss']
})
export class ActivityBarComponent implements OnInit {
  private _status: NormalizedStatus = 'success';
  classes = {};

  @Input() set status(value: string) {
    this._status = this.normalizeStatus(value);

    if(this._status === 'success') {
      this.classes = {
        'bg-success-light': true,
        'border-success': true
      };

      return;
    }

    if(this._status === 'progress') {
      this.classes = {
        'bg-primary-light': true,
        'border-primary': true,
      }
    }

    if(this._status === 'failed') {
      this.classes = {
        'bg-danger-light': true,
        'border-danger': true,
      }
    }
  }

  constructor() { }

  ngOnInit() {
  }

  normalizeStatus(value: string): NormalizedStatus {
    if(value === 'Succeeded' || value === 'succeeded') {
      return 'success';
    }

    if(value === 'Pending' || value === 'pending' || value === 'Running' || value === 'running') {
      return 'progress';
    }

    if(value === 'Failed' || value === 'failed' || value === 'Error' || value === 'error') {
      return 'failed';
    }
  }
}
