import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Alert } from "../alert";

export class AlertActionEvent {
  alert: Alert;
  action: string;
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
    this._alert = alert;

    if(!alert) {
      return;
    }

    setTimeout(() => {
      if(alert && this.autoDismiss) {
        this._alert = null;
      }
    }, this.autoDismissDelay);
  }

  @Input() autoDismiss: boolean = true;
  @Input() autoDismissDelay: number = 5000; //In milliseconds
  @Input() showCloseButton: boolean = true;
  @Input() showIcon = true;
  @Output() alertAction = new EventEmitter<AlertActionEvent>();

  public constructor() {
  }

  ngOnInit(): void {
  }

  public dismiss() {
    this.alertAction.emit({
      alert: this.alert,
      action: 'dismiss',
    });

    this.alert = null;
  }
}
