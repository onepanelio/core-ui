import { Component, Input, OnChanges } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MetricsService } from "./metrics.service";

@Component({
  selector: 'app-metrics',
  templateUrl: './metrics.component.html',
  styleUrls: ['./metrics.component.scss'],
  providers: [MetricsService]
})
export class MetricsComponent implements OnChanges {
    @Input() workflowName: string;
    @Input() podId: string;

    protected namespace: string;
    protected metrics: any;

    constructor(
        private activatedRoute: ActivatedRoute,
        private metricsService: MetricsService
    ) {}

    ngOnChanges() {
        this.activatedRoute.paramMap.subscribe(next => {
            this.namespace = next.get('namespace');

            this.metricsService.getWorkflowMetrics(this.namespace, this.workflowName, this.podId)
            .subscribe(res => {
                this.metrics = JSON.stringify(res);
            });
          });
    }

}