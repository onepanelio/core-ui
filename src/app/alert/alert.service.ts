import { EventEmitter, Injectable } from '@angular/core';
import { JSONUtils } from "../jsonutils/jsonutils";
import { Alert } from "./alert";

@Injectable()
export class AlertService {
  static readonly identifier = 'onepanel-alerts';

  constructor() {
  }

  public alertReceived = new EventEmitter();

  public storeAlert(alert: Alert) {
    const alerts = this.peekLocalAlerts();

    alerts.push(alert);

    localStorage.setItem(AlertService.identifier, JSON.stringify(alerts));

    this.alertReceived.emit();
  }

  public peekLocalAlerts(): Array<Alert> {
    let alertsRaw = localStorage.getItem(AlertService.identifier);

    if (!alertsRaw) {
      alertsRaw = '[]';
    }

    return JSONUtils.fromJSON(JSON.parse(alertsRaw), Alert.fromJSON);
  }

  public getLocalAlerts(): Array<Alert> {
    let alertsRaw = localStorage.getItem(AlertService.identifier);

    if (!alertsRaw) {
      alertsRaw = '[]';
    }

    localStorage.setItem(AlertService.identifier, '[]');

    return JSONUtils.fromJSON(JSON.parse(alertsRaw), Alert.fromJSON);
  }
}
