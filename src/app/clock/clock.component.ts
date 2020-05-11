import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Duration } from "../duration/Duration";

/**
 * Displays an incrementing time given a start Date.
 * If a finished Date is provided, the clock stops incrementing.
 */
@Component({
  selector: 'app-clock',
  templateUrl: './clock.component.html',
  styleUrls: ['./clock.component.scss']
})
export class ClockComponent implements OnInit, OnDestroy {
  private timer = null;
  private _startedAt: Date;
  private _finishedAt: Date;

  @Input() set startedAt(value: string|Date|null) {
    if(!value) {
      return;
    }


    if(typeof(value) === 'string') {
      this._startedAt = new Date(value);
    } else {
      this._startedAt = value;
    }

    this.updateDuration();
  }

  @Input() set finishedAt(value: string|Date|null) {
    if(!value) {
      this._finishedAt = null;
      return
    }

    let proposedFinishedAt: Date|null;

    if(typeof(value) === 'string') {
      proposedFinishedAt = new Date(value);
    } else {
      proposedFinishedAt = value;
    }

    if(proposedFinishedAt.getFullYear() < 2) {
      this._finishedAt = null;
      return;
    }

    this._finishedAt = proposedFinishedAt;

    this.updateDuration();
  }

  /**
   * The default string to display when there is no valid data.
   */
  @Input() defaultString: string = '00:00';

  /**
   * How often to update the clock - in milliseconds.
   * Defaults to 1 second (1000ms)
   */
  @Input() interval = 1000;

  durationString = this.defaultString;
  @Input() durationFormatter = Duration.formatDuration;

  constructor() { }

  ngOnInit() {
    this.reset();
  }

  public reset(resetTimestamps = false) {
    if(resetTimestamps) {
      this._startedAt = undefined;
      this._finishedAt = undefined;
    }

    this.updateDuration();

    this.timer = setInterval(() => {
      this.updateDuration();
    }, this.interval)
  }

  private clearTimer() {
    if(this.timer) {
      clearInterval(this.timer);
    }
  }

  private updateDuration() {
    if (!this._startedAt) {
      this.durationString = this.defaultString;
      return;
    }

    let finishedAt = new Date();
    if (this._finishedAt) {
      finishedAt = this._finishedAt;
    }

    this.durationString = this.durationFormatter(this._startedAt, finishedAt);

    if(this._finishedAt) {
      this.clearTimer();
    }
  }

  ngOnDestroy(): void {
    this.clearTimer();
  }
}
