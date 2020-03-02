import { Component, Input } from '@angular/core';
import { Metric, MetricsService } from "./metrics.service";

@Component({
  selector: 'app-metrics',
  templateUrl: './metrics.component.html',
  styleUrls: ['./metrics.component.scss']
})
export class MetricsComponent {
    @Input() metrics: Metric[] = [];

    constructor(
    ) {}
}
