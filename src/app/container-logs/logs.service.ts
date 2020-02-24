import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { environment } from "../../environments/environment";
import { createJsonLineReader } from "../workflow/workflow.service";

@Injectable()
export class LogsService {
    getPodLogsSocket(args: {
        namespace: string,
        workflowName: string,
        podId: string,
        containerName?: 'main',
        callback?: any,
        completionCallback?: any
                     }) {

        const url =`${environment.baseUrl}/apis/v1beta1/${args.namespace}/workflow_executions/${args.workflowName}/pods/${args.podId}/containers/${args.containerName}/logs`;
        const authToken: string = localStorage.getItem('auth-token');
        const headers = new Headers({
            Authorization: 'Bearer ' + authToken
        });

        fetch(url, {
            credentials: "same-origin",
            headers: headers,
        }).then(response => {
            let reader = response.body.getReader();
            return createJsonLineReader(reader, args.callback, args.completionCallback);
        });
    }
}
