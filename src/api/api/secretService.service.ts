/**
 * Onepanel
 * Onepanel API
 *
 * The version of the OpenAPI document: 1.0.2
 * 
 *
 * NOTE: This class is auto generated by OpenAPI Generator (https://openapi-generator.tech).
 * https://openapi-generator.tech
 * Do not edit the class manually.
 */
/* tslint:disable:no-unused-variable member-ordering */

import { Inject, Injectable, Optional }                      from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams,
         HttpResponse, HttpEvent, HttpParameterCodec }       from '@angular/common/http';
import { CustomHttpParameterCodec }                          from '../encoder';
import { Observable }                                        from 'rxjs';

import { AddSecretKeyValueResponse } from '../model/models';
import { DeleteSecretKeyResponse } from '../model/models';
import { DeleteSecretResponse } from '../model/models';
import { GoogleRpcStatus } from '../model/models';
import { ListSecretsResponse } from '../model/models';
import { Secret } from '../model/models';
import { SecretExistsResponse } from '../model/models';
import { UpdateSecretKeyValueResponse } from '../model/models';

import { BASE_PATH, COLLECTION_FORMATS }                     from '../variables';
import { Configuration }                                     from '../configuration';



@Injectable({
  providedIn: 'root'
})
export class SecretServiceService {

    protected basePath = 'http://localhost:8888';
    public defaultHeaders = new HttpHeaders();
    public configuration = new Configuration();
    public encoder: HttpParameterCodec;

    constructor(protected httpClient: HttpClient, @Optional()@Inject(BASE_PATH) basePath: string, @Optional() configuration: Configuration) {
        if (configuration) {
            this.configuration = configuration;
        }
        if (typeof this.configuration.basePath !== 'string') {
            if (typeof basePath !== 'string') {
                basePath = this.basePath;
            }
            this.configuration.basePath = basePath;
        }
        this.encoder = this.configuration.encoder || new CustomHttpParameterCodec();
    }



    private addToHttpParams(httpParams: HttpParams, value: any, key?: string): HttpParams {
        if (typeof value === "object" && value instanceof Date === false) {
            httpParams = this.addToHttpParamsRecursive(httpParams, value);
        } else {
            httpParams = this.addToHttpParamsRecursive(httpParams, value, key);
        }
        return httpParams;
    }

    private addToHttpParamsRecursive(httpParams: HttpParams, value?: any, key?: string): HttpParams {
        if (value == null) {
            return httpParams;
        }

        if (typeof value === "object") {
            if (Array.isArray(value)) {
                (value as any[]).forEach( elem => httpParams = this.addToHttpParamsRecursive(httpParams, elem, key));
            } else if (value instanceof Date) {
                if (key != null) {
                    httpParams = httpParams.append(key,
                        (value as Date).toISOString().substr(0, 10));
                } else {
                   throw Error("key may not be null if value is Date");
                }
            } else {
                Object.keys(value).forEach( k => httpParams = this.addToHttpParamsRecursive(
                    httpParams, value[k], key != null ? `${key}.${k}` : k));
            }
        } else if (key != null) {
            httpParams = httpParams.append(key, value);
        } else {
            throw Error("key may not be null if value is not object or array");
        }
        return httpParams;
    }

    /**
     * @param namespace 
     * @param secretName 
     * @param body 
     * @param observe set whether or not to return the data Observable as the body, response or events. defaults to returning the body.
     * @param reportProgress flag to report request and response progress.
     */
    public addSecretKeyValue(namespace: string, secretName: string, body: Secret, observe?: 'body', reportProgress?: boolean, options?: {httpHeaderAccept?: 'application/json' | 'application/octet-stream'}): Observable<AddSecretKeyValueResponse>;
    public addSecretKeyValue(namespace: string, secretName: string, body: Secret, observe?: 'response', reportProgress?: boolean, options?: {httpHeaderAccept?: 'application/json' | 'application/octet-stream'}): Observable<HttpResponse<AddSecretKeyValueResponse>>;
    public addSecretKeyValue(namespace: string, secretName: string, body: Secret, observe?: 'events', reportProgress?: boolean, options?: {httpHeaderAccept?: 'application/json' | 'application/octet-stream'}): Observable<HttpEvent<AddSecretKeyValueResponse>>;
    public addSecretKeyValue(namespace: string, secretName: string, body: Secret, observe: any = 'body', reportProgress: boolean = false, options?: {httpHeaderAccept?: 'application/json' | 'application/octet-stream'}): Observable<any> {
        if (namespace === null || namespace === undefined) {
            throw new Error('Required parameter namespace was null or undefined when calling addSecretKeyValue.');
        }
        if (secretName === null || secretName === undefined) {
            throw new Error('Required parameter secretName was null or undefined when calling addSecretKeyValue.');
        }
        if (body === null || body === undefined) {
            throw new Error('Required parameter body was null or undefined when calling addSecretKeyValue.');
        }

        let headers = this.defaultHeaders;

        // authentication (Bearer) required
        if (this.configuration.apiKeys) {
            const key: string | undefined = this.configuration.apiKeys["Bearer"] || this.configuration.apiKeys["authorization"];
            if (key) {
                headers = headers.set('authorization', key);
            }
        }

        let httpHeaderAcceptSelected: string | undefined = options && options.httpHeaderAccept;
        if (httpHeaderAcceptSelected === undefined) {
            // to determine the Accept header
            const httpHeaderAccepts: string[] = [
                'application/json',
                'application/octet-stream'
            ];
            httpHeaderAcceptSelected = this.configuration.selectHeaderAccept(httpHeaderAccepts);
        }
        if (httpHeaderAcceptSelected !== undefined) {
            headers = headers.set('Accept', httpHeaderAcceptSelected);
        }


        // to determine the Content-Type header
        const consumes: string[] = [
            'application/json'
        ];
        const httpContentTypeSelected: string | undefined = this.configuration.selectHeaderContentType(consumes);
        if (httpContentTypeSelected !== undefined) {
            headers = headers.set('Content-Type', httpContentTypeSelected);
        }

        let responseType: 'text' | 'json' = 'json';
        if(httpHeaderAcceptSelected && httpHeaderAcceptSelected.startsWith('text')) {
            responseType = 'text';
        }

        return this.httpClient.post<AddSecretKeyValueResponse>(`${this.configuration.basePath}/apis/v1beta1/${encodeURIComponent(String(namespace))}/secrets/${encodeURIComponent(String(secretName))}`,
            body,
            {
                responseType: <any>responseType,
                withCredentials: this.configuration.withCredentials,
                headers: headers,
                observe: observe,
                reportProgress: reportProgress
            }
        );
    }

    /**
     * @param namespace 
     * @param body 
     * @param observe set whether or not to return the data Observable as the body, response or events. defaults to returning the body.
     * @param reportProgress flag to report request and response progress.
     */
    public createSecret(namespace: string, body: Secret, observe?: 'body', reportProgress?: boolean, options?: {httpHeaderAccept?: 'application/json' | 'application/octet-stream'}): Observable<object>;
    public createSecret(namespace: string, body: Secret, observe?: 'response', reportProgress?: boolean, options?: {httpHeaderAccept?: 'application/json' | 'application/octet-stream'}): Observable<HttpResponse<object>>;
    public createSecret(namespace: string, body: Secret, observe?: 'events', reportProgress?: boolean, options?: {httpHeaderAccept?: 'application/json' | 'application/octet-stream'}): Observable<HttpEvent<object>>;
    public createSecret(namespace: string, body: Secret, observe: any = 'body', reportProgress: boolean = false, options?: {httpHeaderAccept?: 'application/json' | 'application/octet-stream'}): Observable<any> {
        if (namespace === null || namespace === undefined) {
            throw new Error('Required parameter namespace was null or undefined when calling createSecret.');
        }
        if (body === null || body === undefined) {
            throw new Error('Required parameter body was null or undefined when calling createSecret.');
        }

        let headers = this.defaultHeaders;

        // authentication (Bearer) required
        if (this.configuration.apiKeys) {
            const key: string | undefined = this.configuration.apiKeys["Bearer"] || this.configuration.apiKeys["authorization"];
            if (key) {
                headers = headers.set('authorization', key);
            }
        }

        let httpHeaderAcceptSelected: string | undefined = options && options.httpHeaderAccept;
        if (httpHeaderAcceptSelected === undefined) {
            // to determine the Accept header
            const httpHeaderAccepts: string[] = [
                'application/json',
                'application/octet-stream'
            ];
            httpHeaderAcceptSelected = this.configuration.selectHeaderAccept(httpHeaderAccepts);
        }
        if (httpHeaderAcceptSelected !== undefined) {
            headers = headers.set('Accept', httpHeaderAcceptSelected);
        }


        // to determine the Content-Type header
        const consumes: string[] = [
            'application/json'
        ];
        const httpContentTypeSelected: string | undefined = this.configuration.selectHeaderContentType(consumes);
        if (httpContentTypeSelected !== undefined) {
            headers = headers.set('Content-Type', httpContentTypeSelected);
        }

        let responseType: 'text' | 'json' = 'json';
        if(httpHeaderAcceptSelected && httpHeaderAcceptSelected.startsWith('text')) {
            responseType = 'text';
        }

        return this.httpClient.post<object>(`${this.configuration.basePath}/apis/v1beta1/${encodeURIComponent(String(namespace))}/secrets`,
            body,
            {
                responseType: <any>responseType,
                withCredentials: this.configuration.withCredentials,
                headers: headers,
                observe: observe,
                reportProgress: reportProgress
            }
        );
    }

    /**
     * @param namespace 
     * @param name 
     * @param observe set whether or not to return the data Observable as the body, response or events. defaults to returning the body.
     * @param reportProgress flag to report request and response progress.
     */
    public deleteSecret(namespace: string, name: string, observe?: 'body', reportProgress?: boolean, options?: {httpHeaderAccept?: 'application/json' | 'application/octet-stream'}): Observable<DeleteSecretResponse>;
    public deleteSecret(namespace: string, name: string, observe?: 'response', reportProgress?: boolean, options?: {httpHeaderAccept?: 'application/json' | 'application/octet-stream'}): Observable<HttpResponse<DeleteSecretResponse>>;
    public deleteSecret(namespace: string, name: string, observe?: 'events', reportProgress?: boolean, options?: {httpHeaderAccept?: 'application/json' | 'application/octet-stream'}): Observable<HttpEvent<DeleteSecretResponse>>;
    public deleteSecret(namespace: string, name: string, observe: any = 'body', reportProgress: boolean = false, options?: {httpHeaderAccept?: 'application/json' | 'application/octet-stream'}): Observable<any> {
        if (namespace === null || namespace === undefined) {
            throw new Error('Required parameter namespace was null or undefined when calling deleteSecret.');
        }
        if (name === null || name === undefined) {
            throw new Error('Required parameter name was null or undefined when calling deleteSecret.');
        }

        let headers = this.defaultHeaders;

        // authentication (Bearer) required
        if (this.configuration.apiKeys) {
            const key: string | undefined = this.configuration.apiKeys["Bearer"] || this.configuration.apiKeys["authorization"];
            if (key) {
                headers = headers.set('authorization', key);
            }
        }

        let httpHeaderAcceptSelected: string | undefined = options && options.httpHeaderAccept;
        if (httpHeaderAcceptSelected === undefined) {
            // to determine the Accept header
            const httpHeaderAccepts: string[] = [
                'application/json',
                'application/octet-stream'
            ];
            httpHeaderAcceptSelected = this.configuration.selectHeaderAccept(httpHeaderAccepts);
        }
        if (httpHeaderAcceptSelected !== undefined) {
            headers = headers.set('Accept', httpHeaderAcceptSelected);
        }


        let responseType: 'text' | 'json' = 'json';
        if(httpHeaderAcceptSelected && httpHeaderAcceptSelected.startsWith('text')) {
            responseType = 'text';
        }

        return this.httpClient.delete<DeleteSecretResponse>(`${this.configuration.basePath}/apis/v1beta1/${encodeURIComponent(String(namespace))}/secrets/${encodeURIComponent(String(name))}`,
            {
                responseType: <any>responseType,
                withCredentials: this.configuration.withCredentials,
                headers: headers,
                observe: observe,
                reportProgress: reportProgress
            }
        );
    }

    /**
     * @param namespace 
     * @param secretName 
     * @param key 
     * @param observe set whether or not to return the data Observable as the body, response or events. defaults to returning the body.
     * @param reportProgress flag to report request and response progress.
     */
    public deleteSecretKey(namespace: string, secretName: string, key: string, observe?: 'body', reportProgress?: boolean, options?: {httpHeaderAccept?: 'application/json' | 'application/octet-stream'}): Observable<DeleteSecretKeyResponse>;
    public deleteSecretKey(namespace: string, secretName: string, key: string, observe?: 'response', reportProgress?: boolean, options?: {httpHeaderAccept?: 'application/json' | 'application/octet-stream'}): Observable<HttpResponse<DeleteSecretKeyResponse>>;
    public deleteSecretKey(namespace: string, secretName: string, key: string, observe?: 'events', reportProgress?: boolean, options?: {httpHeaderAccept?: 'application/json' | 'application/octet-stream'}): Observable<HttpEvent<DeleteSecretKeyResponse>>;
    public deleteSecretKey(namespace: string, secretName: string, key: string, observe: any = 'body', reportProgress: boolean = false, options?: {httpHeaderAccept?: 'application/json' | 'application/octet-stream'}): Observable<any> {
        if (namespace === null || namespace === undefined) {
            throw new Error('Required parameter namespace was null or undefined when calling deleteSecretKey.');
        }
        if (secretName === null || secretName === undefined) {
            throw new Error('Required parameter secretName was null or undefined when calling deleteSecretKey.');
        }
        if (key === null || key === undefined) {
            throw new Error('Required parameter key was null or undefined when calling deleteSecretKey.');
        }

        let headers = this.defaultHeaders;

        // authentication (Bearer) required
        if (this.configuration.apiKeys) {
            const key: string | undefined = this.configuration.apiKeys["Bearer"] || this.configuration.apiKeys["authorization"];
            if (key) {
                headers = headers.set('authorization', key);
            }
        }

        let httpHeaderAcceptSelected: string | undefined = options && options.httpHeaderAccept;
        if (httpHeaderAcceptSelected === undefined) {
            // to determine the Accept header
            const httpHeaderAccepts: string[] = [
                'application/json',
                'application/octet-stream'
            ];
            httpHeaderAcceptSelected = this.configuration.selectHeaderAccept(httpHeaderAccepts);
        }
        if (httpHeaderAcceptSelected !== undefined) {
            headers = headers.set('Accept', httpHeaderAcceptSelected);
        }


        let responseType: 'text' | 'json' = 'json';
        if(httpHeaderAcceptSelected && httpHeaderAcceptSelected.startsWith('text')) {
            responseType = 'text';
        }

        return this.httpClient.delete<DeleteSecretKeyResponse>(`${this.configuration.basePath}/apis/v1beta1/${encodeURIComponent(String(namespace))}/secrets/${encodeURIComponent(String(secretName))}/keys/${encodeURIComponent(String(key))}`,
            {
                responseType: <any>responseType,
                withCredentials: this.configuration.withCredentials,
                headers: headers,
                observe: observe,
                reportProgress: reportProgress
            }
        );
    }

    /**
     * @param namespace 
     * @param name 
     * @param observe set whether or not to return the data Observable as the body, response or events. defaults to returning the body.
     * @param reportProgress flag to report request and response progress.
     */
    public getSecret(namespace: string, name: string, observe?: 'body', reportProgress?: boolean, options?: {httpHeaderAccept?: 'application/json' | 'application/octet-stream'}): Observable<Secret>;
    public getSecret(namespace: string, name: string, observe?: 'response', reportProgress?: boolean, options?: {httpHeaderAccept?: 'application/json' | 'application/octet-stream'}): Observable<HttpResponse<Secret>>;
    public getSecret(namespace: string, name: string, observe?: 'events', reportProgress?: boolean, options?: {httpHeaderAccept?: 'application/json' | 'application/octet-stream'}): Observable<HttpEvent<Secret>>;
    public getSecret(namespace: string, name: string, observe: any = 'body', reportProgress: boolean = false, options?: {httpHeaderAccept?: 'application/json' | 'application/octet-stream'}): Observable<any> {
        if (namespace === null || namespace === undefined) {
            throw new Error('Required parameter namespace was null or undefined when calling getSecret.');
        }
        if (name === null || name === undefined) {
            throw new Error('Required parameter name was null or undefined when calling getSecret.');
        }

        let headers = this.defaultHeaders;

        // authentication (Bearer) required
        if (this.configuration.apiKeys) {
            const key: string | undefined = this.configuration.apiKeys["Bearer"] || this.configuration.apiKeys["authorization"];
            if (key) {
                headers = headers.set('authorization', key);
            }
        }

        let httpHeaderAcceptSelected: string | undefined = options && options.httpHeaderAccept;
        if (httpHeaderAcceptSelected === undefined) {
            // to determine the Accept header
            const httpHeaderAccepts: string[] = [
                'application/json',
                'application/octet-stream'
            ];
            httpHeaderAcceptSelected = this.configuration.selectHeaderAccept(httpHeaderAccepts);
        }
        if (httpHeaderAcceptSelected !== undefined) {
            headers = headers.set('Accept', httpHeaderAcceptSelected);
        }


        let responseType: 'text' | 'json' = 'json';
        if(httpHeaderAcceptSelected && httpHeaderAcceptSelected.startsWith('text')) {
            responseType = 'text';
        }

        return this.httpClient.get<Secret>(`${this.configuration.basePath}/apis/v1beta1/${encodeURIComponent(String(namespace))}/secrets/${encodeURIComponent(String(name))}`,
            {
                responseType: <any>responseType,
                withCredentials: this.configuration.withCredentials,
                headers: headers,
                observe: observe,
                reportProgress: reportProgress
            }
        );
    }

    /**
     * @param namespace 
     * @param observe set whether or not to return the data Observable as the body, response or events. defaults to returning the body.
     * @param reportProgress flag to report request and response progress.
     */
    public listSecrets(namespace: string, observe?: 'body', reportProgress?: boolean, options?: {httpHeaderAccept?: 'application/json' | 'application/octet-stream'}): Observable<ListSecretsResponse>;
    public listSecrets(namespace: string, observe?: 'response', reportProgress?: boolean, options?: {httpHeaderAccept?: 'application/json' | 'application/octet-stream'}): Observable<HttpResponse<ListSecretsResponse>>;
    public listSecrets(namespace: string, observe?: 'events', reportProgress?: boolean, options?: {httpHeaderAccept?: 'application/json' | 'application/octet-stream'}): Observable<HttpEvent<ListSecretsResponse>>;
    public listSecrets(namespace: string, observe: any = 'body', reportProgress: boolean = false, options?: {httpHeaderAccept?: 'application/json' | 'application/octet-stream'}): Observable<any> {
        if (namespace === null || namespace === undefined) {
            throw new Error('Required parameter namespace was null or undefined when calling listSecrets.');
        }

        let headers = this.defaultHeaders;

        // authentication (Bearer) required
        if (this.configuration.apiKeys) {
            const key: string | undefined = this.configuration.apiKeys["Bearer"] || this.configuration.apiKeys["authorization"];
            if (key) {
                headers = headers.set('authorization', key);
            }
        }

        let httpHeaderAcceptSelected: string | undefined = options && options.httpHeaderAccept;
        if (httpHeaderAcceptSelected === undefined) {
            // to determine the Accept header
            const httpHeaderAccepts: string[] = [
                'application/json',
                'application/octet-stream'
            ];
            httpHeaderAcceptSelected = this.configuration.selectHeaderAccept(httpHeaderAccepts);
        }
        if (httpHeaderAcceptSelected !== undefined) {
            headers = headers.set('Accept', httpHeaderAcceptSelected);
        }


        let responseType: 'text' | 'json' = 'json';
        if(httpHeaderAcceptSelected && httpHeaderAcceptSelected.startsWith('text')) {
            responseType = 'text';
        }

        return this.httpClient.get<ListSecretsResponse>(`${this.configuration.basePath}/apis/v1beta1/${encodeURIComponent(String(namespace))}/secrets`,
            {
                responseType: <any>responseType,
                withCredentials: this.configuration.withCredentials,
                headers: headers,
                observe: observe,
                reportProgress: reportProgress
            }
        );
    }

    /**
     * @param namespace 
     * @param name 
     * @param observe set whether or not to return the data Observable as the body, response or events. defaults to returning the body.
     * @param reportProgress flag to report request and response progress.
     */
    public secretExists(namespace: string, name: string, observe?: 'body', reportProgress?: boolean, options?: {httpHeaderAccept?: 'application/json' | 'application/octet-stream'}): Observable<SecretExistsResponse>;
    public secretExists(namespace: string, name: string, observe?: 'response', reportProgress?: boolean, options?: {httpHeaderAccept?: 'application/json' | 'application/octet-stream'}): Observable<HttpResponse<SecretExistsResponse>>;
    public secretExists(namespace: string, name: string, observe?: 'events', reportProgress?: boolean, options?: {httpHeaderAccept?: 'application/json' | 'application/octet-stream'}): Observable<HttpEvent<SecretExistsResponse>>;
    public secretExists(namespace: string, name: string, observe: any = 'body', reportProgress: boolean = false, options?: {httpHeaderAccept?: 'application/json' | 'application/octet-stream'}): Observable<any> {
        if (namespace === null || namespace === undefined) {
            throw new Error('Required parameter namespace was null or undefined when calling secretExists.');
        }
        if (name === null || name === undefined) {
            throw new Error('Required parameter name was null or undefined when calling secretExists.');
        }

        let headers = this.defaultHeaders;

        // authentication (Bearer) required
        if (this.configuration.apiKeys) {
            const key: string | undefined = this.configuration.apiKeys["Bearer"] || this.configuration.apiKeys["authorization"];
            if (key) {
                headers = headers.set('authorization', key);
            }
        }

        let httpHeaderAcceptSelected: string | undefined = options && options.httpHeaderAccept;
        if (httpHeaderAcceptSelected === undefined) {
            // to determine the Accept header
            const httpHeaderAccepts: string[] = [
                'application/json',
                'application/octet-stream'
            ];
            httpHeaderAcceptSelected = this.configuration.selectHeaderAccept(httpHeaderAccepts);
        }
        if (httpHeaderAcceptSelected !== undefined) {
            headers = headers.set('Accept', httpHeaderAcceptSelected);
        }


        let responseType: 'text' | 'json' = 'json';
        if(httpHeaderAcceptSelected && httpHeaderAcceptSelected.startsWith('text')) {
            responseType = 'text';
        }

        return this.httpClient.get<SecretExistsResponse>(`${this.configuration.basePath}/apis/v1beta1/${encodeURIComponent(String(namespace))}/secrets/${encodeURIComponent(String(name))}/exists`,
            {
                responseType: <any>responseType,
                withCredentials: this.configuration.withCredentials,
                headers: headers,
                observe: observe,
                reportProgress: reportProgress
            }
        );
    }

    /**
     * @param namespace 
     * @param secretName 
     * @param body 
     * @param observe set whether or not to return the data Observable as the body, response or events. defaults to returning the body.
     * @param reportProgress flag to report request and response progress.
     */
    public updateSecretKeyValue(namespace: string, secretName: string, body: Secret, observe?: 'body', reportProgress?: boolean, options?: {httpHeaderAccept?: 'application/json' | 'application/octet-stream'}): Observable<UpdateSecretKeyValueResponse>;
    public updateSecretKeyValue(namespace: string, secretName: string, body: Secret, observe?: 'response', reportProgress?: boolean, options?: {httpHeaderAccept?: 'application/json' | 'application/octet-stream'}): Observable<HttpResponse<UpdateSecretKeyValueResponse>>;
    public updateSecretKeyValue(namespace: string, secretName: string, body: Secret, observe?: 'events', reportProgress?: boolean, options?: {httpHeaderAccept?: 'application/json' | 'application/octet-stream'}): Observable<HttpEvent<UpdateSecretKeyValueResponse>>;
    public updateSecretKeyValue(namespace: string, secretName: string, body: Secret, observe: any = 'body', reportProgress: boolean = false, options?: {httpHeaderAccept?: 'application/json' | 'application/octet-stream'}): Observable<any> {
        if (namespace === null || namespace === undefined) {
            throw new Error('Required parameter namespace was null or undefined when calling updateSecretKeyValue.');
        }
        if (secretName === null || secretName === undefined) {
            throw new Error('Required parameter secretName was null or undefined when calling updateSecretKeyValue.');
        }
        if (body === null || body === undefined) {
            throw new Error('Required parameter body was null or undefined when calling updateSecretKeyValue.');
        }

        let headers = this.defaultHeaders;

        // authentication (Bearer) required
        if (this.configuration.apiKeys) {
            const key: string | undefined = this.configuration.apiKeys["Bearer"] || this.configuration.apiKeys["authorization"];
            if (key) {
                headers = headers.set('authorization', key);
            }
        }

        let httpHeaderAcceptSelected: string | undefined = options && options.httpHeaderAccept;
        if (httpHeaderAcceptSelected === undefined) {
            // to determine the Accept header
            const httpHeaderAccepts: string[] = [
                'application/json',
                'application/octet-stream'
            ];
            httpHeaderAcceptSelected = this.configuration.selectHeaderAccept(httpHeaderAccepts);
        }
        if (httpHeaderAcceptSelected !== undefined) {
            headers = headers.set('Accept', httpHeaderAcceptSelected);
        }


        // to determine the Content-Type header
        const consumes: string[] = [
            'application/json'
        ];
        const httpContentTypeSelected: string | undefined = this.configuration.selectHeaderContentType(consumes);
        if (httpContentTypeSelected !== undefined) {
            headers = headers.set('Content-Type', httpContentTypeSelected);
        }

        let responseType: 'text' | 'json' = 'json';
        if(httpHeaderAcceptSelected && httpHeaderAcceptSelected.startsWith('text')) {
            responseType = 'text';
        }

        return this.httpClient.patch<UpdateSecretKeyValueResponse>(`${this.configuration.basePath}/apis/v1beta1/${encodeURIComponent(String(namespace))}/secrets/${encodeURIComponent(String(secretName))}`,
            body,
            {
                responseType: <any>responseType,
                withCredentials: this.configuration.withCredentials,
                headers: headers,
                observe: observe,
                reportProgress: reportProgress
            }
        );
    }

}
