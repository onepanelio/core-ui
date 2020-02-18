import { Component, Input, OnInit } from '@angular/core';
import { Subscription } from "rxjs";
import { AlertService } from "../alert.service";
import { Alert } from "../alert";
import { AlertActionEvent } from "../alert/alert.component";

interface AlertDisplayConfig {
  autoDismiss?: boolean;
  autoDismissDelay?: number;
  showCloseButton?: boolean;
  showIcon?: boolean;
}

/**
 * Wrapper for an alert so we can configure each alert display individually
 */
interface AlertWrapper {
  alert: Alert;
  config: AlertDisplayConfig;
}

@Component({
  selector: 'app-alert-panel',
  templateUrl: './alert-panel.component.html',
  styleUrls: ['./alert-panel.component.scss']
})
export class AlertPanelComponent implements OnInit {
  @Input() autoDismiss = false;
  @Input() autoDismissDelay = 5000;
  @Input() showCloseButton = true;
  @Input() showIcon = false;
  @Input() wipeOld = true;

  private subscribeReference: Subscription = null;

  alerts = Array<AlertWrapper>();

  constructor(
      private alertService: AlertService,
  ) {
  }

  ngOnInit() {
    this.alerts = this.wrapAlerts(this.alertService.getLocalAlerts());

    this.subscribeReference = this.alertService.alertReceived.subscribe(
        (_successs) => {
          const newAlerts = this.wrapAlerts(this.alertService.getLocalAlerts());

          if (!this.wipeOld) {
            newAlerts.unshift(...this.alerts);
          }

          this.alerts = newAlerts;
        },
        (_failure) => {
          // Do nothing
        },
    );
  }

  ngOnDestroy() {
    this.subscribeReference.unsubscribe();
  }

  onAlertAction(event: AlertActionEvent) {
    if (event.action === 'dismiss') {
      let index = -1;

      for (let i = 0; i < this.alerts.length; i++) {
        if (this.alerts[i].alert === event.alert) {
          index = i;
          break;
        }
      }

      if (index < 0) {
        return;
      }

      this.alerts.splice(index, 1);
    }
  }

  push(alert: Alert, config?: AlertDisplayConfig) {
    const newAlerts = this.alerts.slice();

    const wrapper = {
      alert: alert,
      config: AlertPanelComponent.fillInDefaultConfig(config)
    };

    newAlerts.unshift(wrapper);

    this.alerts = newAlerts;
  }

  unshift(alert: Alert, config?: AlertDisplayConfig) {
    const newAlerts = this.alerts.slice();

    const wrapper = {
      alert: alert,
      config: AlertPanelComponent.fillInDefaultConfig(config)
    };

    newAlerts.unshift(wrapper);

    this.alerts = newAlerts;
  }

  insert(index, alert: Alert, config?: AlertDisplayConfig) {
    const newAlerts = this.alerts.slice();

    const wrapper = {
      alert: alert,
      config: AlertPanelComponent.fillInDefaultConfig(config)
    };

    newAlerts.unshift(wrapper);
    newAlerts.splice(index, 0, wrapper);

    this.alerts = newAlerts;
  }

  private wrapAlerts(alerts: Alert[]): AlertWrapper[] {
    const wrapped = Array<AlertWrapper>();

    for (const alert of alerts) {
      const wrapper = {
        alert: alert,
        config: {
          autoDismiss: this.autoDismiss,
          autoDismissDelay: this.autoDismissDelay,
          showCloseButton: this.showCloseButton,
          showIcon: this.showIcon,
        }
      };

      wrapped.push(wrapper);
    }

    return wrapped;
  }

  static fillInDefaultConfig(config?: AlertDisplayConfig): AlertDisplayConfig {
    let finalConfig = {
      autoDismiss: false,
      autoDismissDelay: 5000,
      showCloseButton: true,
      showIcon: true,
    };

    if(config) {
      finalConfig.autoDismiss = finalConfig.autoDismiss || config.autoDismiss;
      finalConfig.showCloseButton = finalConfig.showCloseButton || config.showCloseButton;
      finalConfig.showIcon = finalConfig.showIcon || config.showIcon;

      if(config.autoDismissDelay) {
        finalConfig.autoDismissDelay = config.autoDismissDelay;
      }
    }

    return finalConfig;
  }
}
