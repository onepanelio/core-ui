import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";

export interface Secret {
    name: string;
    data: Map<string, string>;
}

@Injectable()
export class SecretService {

    private baseUrl = 'http://localhost:8888';
    private baseRPCUrl = 'localhost:8888';

    constructor(private client: HttpClient) {
    }

    getSecret(namespace: string, name: string) {
        const url = `${this.baseUrl}/apis/v1beta1/${namespace}/secrets/${name}`;
        return this.client.get<Secret>(url);
    }
}
