import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { environment } from "../../../environments/environment";

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
    constructor(private client: HttpClient) {
    }

    getWorkflowMetrics(namespace: string, workflowName: string, podId: string) {
        const url = `${environment.baseUrl}/apis/v1beta1/${namespace}/workflow_executions/${workflowName}/pods/${podId}/metrics`;

        return this.client.get<GetMetricsResponse>(url);
    }
}
