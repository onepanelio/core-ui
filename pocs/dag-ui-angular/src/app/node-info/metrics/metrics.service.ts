import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";

@Injectable()
export class MetricsService {

    private baseUrl = 'http://localhost:8888';

    constructor(private client: HttpClient) {
    }

    getWorkflowMetrics(namespace: string, workflowName: string, podId: string) {
        const url = `${this.baseUrl}/apis/v1beta1/${namespace}/workflows/${workflowName}/pods/${podId}/metrics`;

        return this.client.get(url, {});
    }
}
