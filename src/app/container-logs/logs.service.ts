import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";

@Injectable()
export class LogsService {

    private baseUrl = 'http://localhost:8888';
    private baseRPCUrl = 'localhost:8888';


    constructor(private client: HttpClient) {
    }

    getPodLogsSocket(namespace: string, workflowName: string, podId: string, containerName: string = 'main') {
        const url = `ws://${this.baseRPCUrl}/apis/v1beta1/${namespace}/workflow_executions/${workflowName}/pods/${podId}/containers/${containerName}/logs`;

        return new WebSocket(url);
    }
}
