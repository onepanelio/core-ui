import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";

export interface Metric {
    name: string;
    value: number;
    format: string;
}

export interface GetMetricsResponse {
    metrics: Metric[];
}

@Injectable()
export class MetricsService {

    private baseUrl = 'http://localhost:8888';

    constructor(private client: HttpClient) {
    }

    getWorkflowMetrics(namespace: string, workflowName: string, podId: string) {
        const url = `${this.baseUrl}/apis/v1beta1/${namespace}/workflow_executions/${workflowName}/pods/${podId}/metrics`;

        return this.client.get<GetMetricsResponse>(url);
    }
}
