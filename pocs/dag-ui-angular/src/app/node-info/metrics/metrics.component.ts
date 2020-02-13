import { Component, Input, OnChanges } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Metric, MetricsService } from "./metrics.service";
import { WorkflowPhase } from "../../workflow/workflow.service";

@Component({
  selector: 'app-metrics',
  templateUrl: './metrics.component.html',
  styleUrls: ['./metrics.component.scss'],
  providers: [MetricsService]
})
export class MetricsComponent implements OnChanges {
    @Input() workflowName: string;
    @Input() podId: string;
    @Input() nodePhase: WorkflowPhase;

    protected namespace: string;
    protected metrics: Metric[];

    constructor(
        private activatedRoute: ActivatedRoute,
        private metricsService: MetricsService
    ) {}

    ngOnChanges() {
        this.activatedRoute.paramMap.subscribe(next => {
            this.metrics = [];
            this.namespace = next.get('namespace');

            this.metricsService.getWorkflowMetrics(this.namespace, this.workflowName, this.podId)
            .subscribe(res => {
                this.metrics = res.metrics;
            });
          });
    }

}