import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";

export interface NamespaceListResponse {
    count: number;
    namespaces: Array<{name:string}>;
}

@Injectable()
export class NamespaceService {

    private baseUrl = 'http://localhost:8888';
    private baseRPCUrl = 'localhost:8888';

    activateNamespace: string = 'default';

    constructor(private client: HttpClient) {
    }

    listNamespaces() {
        const url = `${this.baseUrl}/apis/v1beta1/namespaces`;
        return this.client.get<NamespaceListResponse>(url);
    }
}
