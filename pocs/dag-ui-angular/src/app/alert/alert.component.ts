import { Component, Input, OnInit } from '@angular/core';

export type AlertType = 'success' | 'warning' | 'danger' | 'info';

export interface Alert {
  title?: string;
  message: string;
  type?: AlertType;
}

@Component({
  selector: 'app-alert',
  templateUrl: './alert.component.html',
  styleUrls: ['./alert.component.scss']
})
export class AlertComponent implements OnInit {
  private _alert: Alert = null;

  get alert(): Alert {
    return this._alert;
  }
  @Input() set alert(alert: Alert) {
    if (alert && !alert.type) {
      alert.type = 'success';
    }

    this._alert = alert;

    setTimeout(() => {
      if(alert && this.autoDismiss) {
        this._alert = null;
      }
    }, this.autoDismissDelay);
  }

  @Input() autoDismiss: boolean = true;
  @Input() autoDismissDelay: number = 5000; //In milliseconds
  @Input() showCloseButton: boolean = true;

  public constructor() {
  }

  ngOnInit(): void {
  }

  public dismiss() {
    this.alert = null;
  }
}
