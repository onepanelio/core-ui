import { Component, Input, OnDestroy, OnInit } from '@angular/core';

@Component({
  selector: 'app-launching-timer',
  templateUrl: './launching-timer.component.html',
  styleUrls: ['./launching-timer.component.scss']
})
export class LaunchingTimerComponent implements OnInit, OnDestroy {
  private _startedAt: Date;

  @Input() set startedAt(value: string) {
    this._startedAt = new Date(value);
  }

  @Input() maxMinutes = 5;

  timer: number;

  timeLeft: string;

  constructor() {
  }

  ngOnInit() {
    this.timer = setInterval(() => {
      this.timerUpdate();
    }, 1000);
  }

  ngOnDestroy() {
    if(this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }

  timerUpdate() {
    if (!this._startedAt) {
      return;
    }

    const now = new Date();
    const secondsDifference = (now.getTime() - this._startedAt.getTime()) / 1000.0;

    const maxSeconds = this.maxMinutes * 60;

    const secondsLeft = maxSeconds - secondsDifference;

    this.timeLeft = this.formatDuration(secondsLeft);
  }

  formatDuration(secondsLeft: number): string {
    if(secondsLeft < 60) {
      return 'Less than 1 minute';
    }

    for(let i = 2; i <= this.maxMinutes; i++) {
      const minutesAsSeconds = i * 60;

      if(secondsLeft < minutesAsSeconds) {
        return `~ ${i} minutes left`;
      }
    }

    return `~ ${this.maxMinutes} minutes left`;
  }
}
