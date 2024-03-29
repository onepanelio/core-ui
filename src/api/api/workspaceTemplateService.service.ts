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

import { GoogleRpcStatus } from '../model/models';
import { ListWorkspaceTemplateVersionsResponse } from '../model/models';
import { ListWorkspaceTemplatesFieldResponse } from '../model/models';
import { ListWorkspaceTemplatesResponse } from '../model/models';
import { WorkflowTemplate } from '../model/models';
import { WorkspaceTemplate } from '../model/models';

import { BASE_PATH, COLLECTION_FORMATS }                     from '../variables';
import { Configuration }                                     from '../configuration';



@Injectable({
  providedIn: 'root'
})
export class WorkspaceTemplateServiceService {

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
     * Archives a WorkspaceTemplate
     * @param namespace 
     * @param uid 
     * @param observe set whether or not to return the data Observable as the body, response or events. defaults to returning the body.
     * @param reportProgress flag to report request and response progress.
     */
    public archiveWorkspaceTemplate(namespace: string, uid: string, observe?: 'body', reportProgress?: boolean, options?: {httpHeaderAccept?: 'application/json' | 'application/octet-stream'}): Observable<WorkspaceTemplate>;
    public archiveWorkspaceTemplate(namespace: string, uid: string, observe?: 'response', reportProgress?: boolean, options?: {httpHeaderAccept?: 'application/json' | 'application/octet-stream'}): Observable<HttpResponse<WorkspaceTemplate>>;
    public archiveWorkspaceTemplate(namespace: string, uid: string, observe?: 'events', reportProgress?: boolean, options?: {httpHeaderAccept?: 'application/json' | 'application/octet-stream'}): Observable<HttpEvent<WorkspaceTemplate>>;
    public archiveWorkspaceTemplate(namespace: string, uid: string, observe: any = 'body', reportProgress: boolean = false, options?: {httpHeaderAccept?: 'application/json' | 'application/octet-stream'}): Observable<any> {
        if (namespace === null || namespace === undefined) {
            throw new Error('Required parameter namespace was null or undefined when calling archiveWorkspaceTemplate.');
        }
        if (uid === null || uid === undefined) {
            throw new Error('Required parameter uid was null or undefined when calling archiveWorkspaceTemplate.');
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

        return this.httpClient.put<WorkspaceTemplate>(`${this.configuration.basePath}/apis/v1beta1/${encodeURIComponent(String(namespace))}/workspace_templates/${encodeURIComponent(String(uid))}/archive`,
            null,
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
     * Creates a WorkspaceTemplate
     * @param namespace 
     * @param body 
     * @param observe set whether or not to return the data Observable as the body, response or events. defaults to returning the body.
     * @param reportProgress flag to report request and response progress.
     */
    public createWorkspaceTemplate(namespace: string, body: WorkspaceTemplate, observe?: 'body', reportProgress?: boolean, options?: {httpHeaderAccept?: 'application/json' | 'application/octet-stream'}): Observable<WorkspaceTemplate>;
    public createWorkspaceTemplate(namespace: string, body: WorkspaceTemplate, observe?: 'response', reportProgress?: boolean, options?: {httpHeaderAccept?: 'application/json' | 'application/octet-stream'}): Observable<HttpResponse<WorkspaceTemplate>>;
    public createWorkspaceTemplate(namespace: string, body: WorkspaceTemplate, observe?: 'events', reportProgress?: boolean, options?: {httpHeaderAccept?: 'application/json' | 'application/octet-stream'}): Observable<HttpEvent<WorkspaceTemplate>>;
    public createWorkspaceTemplate(namespace: string, body: WorkspaceTemplate, observe: any = 'body', reportProgress: boolean = false, options?: {httpHeaderAccept?: 'application/json' | 'application/octet-stream'}): Observable<any> {
        if (namespace === null || namespace === undefined) {
            throw new Error('Required parameter namespace was null or undefined when calling createWorkspaceTemplate.');
        }
        if (body === null || body === undefined) {
            throw new Error('Required parameter body was null or undefined when calling createWorkspaceTemplate.');
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

        return this.httpClient.post<WorkspaceTemplate>(`${this.configuration.basePath}/apis/v1beta1/${encodeURIComponent(String(namespace))}/workspace_templates`,
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
     * Get the generated WorkflowTemplate for a WorkspaceTemplate
     * @param namespace 
     * @param uid 
     * @param body 
     * @param observe set whether or not to return the data Observable as the body, response or events. defaults to returning the body.
     * @param reportProgress flag to report request and response progress.
     */
    public generateWorkspaceTemplateWorkflowTemplate(namespace: string, uid: string, body: WorkspaceTemplate, observe?: 'body', reportProgress?: boolean, options?: {httpHeaderAccept?: 'application/json' | 'application/octet-stream'}): Observable<WorkflowTemplate>;
    public generateWorkspaceTemplateWorkflowTemplate(namespace: string, uid: string, body: WorkspaceTemplate, observe?: 'response', reportProgress?: boolean, options?: {httpHeaderAccept?: 'application/json' | 'application/octet-stream'}): Observable<HttpResponse<WorkflowTemplate>>;
    public generateWorkspaceTemplateWorkflowTemplate(namespace: string, uid: string, body: WorkspaceTemplate, observe?: 'events', reportProgress?: boolean, options?: {httpHeaderAccept?: 'application/json' | 'application/octet-stream'}): Observable<HttpEvent<WorkflowTemplate>>;
    public generateWorkspaceTemplateWorkflowTemplate(namespace: string, uid: string, body: WorkspaceTemplate, observe: any = 'body', reportProgress: boolean = false, options?: {httpHeaderAccept?: 'application/json' | 'application/octet-stream'}): Observable<any> {
        if (namespace === null || namespace === undefined) {
            throw new Error('Required parameter namespace was null or undefined when calling generateWorkspaceTemplateWorkflowTemplate.');
        }
        if (uid === null || uid === undefined) {
            throw new Error('Required parameter uid was null or undefined when calling generateWorkspaceTemplateWorkflowTemplate.');
        }
        if (body === null || body === undefined) {
            throw new Error('Required parameter body was null or undefined when calling generateWorkspaceTemplateWorkflowTemplate.');
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

        return this.httpClient.post<WorkflowTemplate>(`${this.configuration.basePath}/apis/v1beta1/${encodeURIComponent(String(namespace))}/workspace_templates/${encodeURIComponent(String(uid))}/workflow_template`,
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
     * Get a WorkspaceTemplate
     * @param namespace 
     * @param uid 
     * @param version 
     * @param observe set whether or not to return the data Observable as the body, response or events. defaults to returning the body.
     * @param reportProgress flag to report request and response progress.
     */
    public getWorkspaceTemplate(namespace: string, uid: string, version?: string, observe?: 'body', reportProgress?: boolean, options?: {httpHeaderAccept?: 'application/json' | 'application/octet-stream'}): Observable<WorkspaceTemplate>;
    public getWorkspaceTemplate(namespace: string, uid: string, version?: string, observe?: 'response', reportProgress?: boolean, options?: {httpHeaderAccept?: 'application/json' | 'application/octet-stream'}): Observable<HttpResponse<WorkspaceTemplate>>;
    public getWorkspaceTemplate(namespace: string, uid: string, version?: string, observe?: 'events', reportProgress?: boolean, options?: {httpHeaderAccept?: 'application/json' | 'application/octet-stream'}): Observable<HttpEvent<WorkspaceTemplate>>;
    public getWorkspaceTemplate(namespace: string, uid: string, version?: string, observe: any = 'body', reportProgress: boolean = false, options?: {httpHeaderAccept?: 'application/json' | 'application/octet-stream'}): Observable<any> {
        if (namespace === null || namespace === undefined) {
            throw new Error('Required parameter namespace was null or undefined when calling getWorkspaceTemplate.');
        }
        if (uid === null || uid === undefined) {
            throw new Error('Required parameter uid was null or undefined when calling getWorkspaceTemplate.');
        }

        let queryParameters = new HttpParams({encoder: this.encoder});
        if (version !== undefined && version !== null) {
          queryParameters = this.addToHttpParams(queryParameters,
            <any>version, 'version');
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

        return this.httpClient.get<WorkspaceTemplate>(`${this.configuration.basePath}/apis/v1beta1/${encodeURIComponent(String(namespace))}/workspace_templates/${encodeURIComponent(String(uid))}`,
            {
                params: queryParameters,
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
     * @param uid 
     * @param observe set whether or not to return the data Observable as the body, response or events. defaults to returning the body.
     * @param reportProgress flag to report request and response progress.
     */
    public listWorkspaceTemplateVersions(namespace: string, uid: string, observe?: 'body', reportProgress?: boolean, options?: {httpHeaderAccept?: 'application/json' | 'application/octet-stream'}): Observable<ListWorkspaceTemplateVersionsResponse>;
    public listWorkspaceTemplateVersions(namespace: string, uid: string, observe?: 'response', reportProgress?: boolean, options?: {httpHeaderAccept?: 'application/json' | 'application/octet-stream'}): Observable<HttpResponse<ListWorkspaceTemplateVersionsResponse>>;
    public listWorkspaceTemplateVersions(namespace: string, uid: string, observe?: 'events', reportProgress?: boolean, options?: {httpHeaderAccept?: 'application/json' | 'application/octet-stream'}): Observable<HttpEvent<ListWorkspaceTemplateVersionsResponse>>;
    public listWorkspaceTemplateVersions(namespace: string, uid: string, observe: any = 'body', reportProgress: boolean = false, options?: {httpHeaderAccept?: 'application/json' | 'application/octet-stream'}): Observable<any> {
        if (namespace === null || namespace === undefined) {
            throw new Error('Required parameter namespace was null or undefined when calling listWorkspaceTemplateVersions.');
        }
        if (uid === null || uid === undefined) {
            throw new Error('Required parameter uid was null or undefined when calling listWorkspaceTemplateVersions.');
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

        return this.httpClient.get<ListWorkspaceTemplateVersionsResponse>(`${this.configuration.basePath}/apis/v1beta1/${encodeURIComponent(String(namespace))}/workspace_templates/${encodeURIComponent(String(uid))}/versions`,
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
     * @param pageSize 
     * @param page 
     * @param order 
     * @param labels 
     * @param uid 
     * @param observe set whether or not to return the data Observable as the body, response or events. defaults to returning the body.
     * @param reportProgress flag to report request and response progress.
     */
    public listWorkspaceTemplates(namespace: string, pageSize?: number, page?: number, order?: string, labels?: string, uid?: string, observe?: 'body', reportProgress?: boolean, options?: {httpHeaderAccept?: 'application/json' | 'application/octet-stream'}): Observable<ListWorkspaceTemplatesResponse>;
    public listWorkspaceTemplates(namespace: string, pageSize?: number, page?: number, order?: string, labels?: string, uid?: string, observe?: 'response', reportProgress?: boolean, options?: {httpHeaderAccept?: 'application/json' | 'application/octet-stream'}): Observable<HttpResponse<ListWorkspaceTemplatesResponse>>;
    public listWorkspaceTemplates(namespace: string, pageSize?: number, page?: number, order?: string, labels?: string, uid?: string, observe?: 'events', reportProgress?: boolean, options?: {httpHeaderAccept?: 'application/json' | 'application/octet-stream'}): Observable<HttpEvent<ListWorkspaceTemplatesResponse>>;
    public listWorkspaceTemplates(namespace: string, pageSize?: number, page?: number, order?: string, labels?: string, uid?: string, observe: any = 'body', reportProgress: boolean = false, options?: {httpHeaderAccept?: 'application/json' | 'application/octet-stream'}): Observable<any> {
        if (namespace === null || namespace === undefined) {
            throw new Error('Required parameter namespace was null or undefined when calling listWorkspaceTemplates.');
        }

        let queryParameters = new HttpParams({encoder: this.encoder});
        if (pageSize !== undefined && pageSize !== null) {
          queryParameters = this.addToHttpParams(queryParameters,
            <any>pageSize, 'pageSize');
        }
        if (page !== undefined && page !== null) {
          queryParameters = this.addToHttpParams(queryParameters,
            <any>page, 'page');
        }
        if (order !== undefined && order !== null) {
          queryParameters = this.addToHttpParams(queryParameters,
            <any>order, 'order');
        }
        if (labels !== undefined && labels !== null) {
          queryParameters = this.addToHttpParams(queryParameters,
            <any>labels, 'labels');
        }
        if (uid !== undefined && uid !== null) {
          queryParameters = this.addToHttpParams(queryParameters,
            <any>uid, 'uid');
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

        return this.httpClient.get<ListWorkspaceTemplatesResponse>(`${this.configuration.basePath}/apis/v1beta1/${encodeURIComponent(String(namespace))}/workspace_templates`,
            {
                params: queryParameters,
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
     * @param fieldName 
     * @param observe set whether or not to return the data Observable as the body, response or events. defaults to returning the body.
     * @param reportProgress flag to report request and response progress.
     */
    public listWorkspaceTemplatesField(namespace: string, fieldName: string, observe?: 'body', reportProgress?: boolean, options?: {httpHeaderAccept?: 'application/json' | 'application/octet-stream'}): Observable<ListWorkspaceTemplatesFieldResponse>;
    public listWorkspaceTemplatesField(namespace: string, fieldName: string, observe?: 'response', reportProgress?: boolean, options?: {httpHeaderAccept?: 'application/json' | 'application/octet-stream'}): Observable<HttpResponse<ListWorkspaceTemplatesFieldResponse>>;
    public listWorkspaceTemplatesField(namespace: string, fieldName: string, observe?: 'events', reportProgress?: boolean, options?: {httpHeaderAccept?: 'application/json' | 'application/octet-stream'}): Observable<HttpEvent<ListWorkspaceTemplatesFieldResponse>>;
    public listWorkspaceTemplatesField(namespace: string, fieldName: string, observe: any = 'body', reportProgress: boolean = false, options?: {httpHeaderAccept?: 'application/json' | 'application/octet-stream'}): Observable<any> {
        if (namespace === null || namespace === undefined) {
            throw new Error('Required parameter namespace was null or undefined when calling listWorkspaceTemplatesField.');
        }
        if (fieldName === null || fieldName === undefined) {
            throw new Error('Required parameter fieldName was null or undefined when calling listWorkspaceTemplatesField.');
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

        return this.httpClient.get<ListWorkspaceTemplatesFieldResponse>(`${this.configuration.basePath}/apis/v1beta/${encodeURIComponent(String(namespace))}/field/workspace_templates/${encodeURIComponent(String(fieldName))}`,
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
     * Updates a WorkspaceTemplate
     * @param namespace 
     * @param uid 
     * @param body 
     * @param observe set whether or not to return the data Observable as the body, response or events. defaults to returning the body.
     * @param reportProgress flag to report request and response progress.
     */
    public updateWorkspaceTemplate(namespace: string, uid: string, body: WorkspaceTemplate, observe?: 'body', reportProgress?: boolean, options?: {httpHeaderAccept?: 'application/json' | 'application/octet-stream'}): Observable<WorkspaceTemplate>;
    public updateWorkspaceTemplate(namespace: string, uid: string, body: WorkspaceTemplate, observe?: 'response', reportProgress?: boolean, options?: {httpHeaderAccept?: 'application/json' | 'application/octet-stream'}): Observable<HttpResponse<WorkspaceTemplate>>;
    public updateWorkspaceTemplate(namespace: string, uid: string, body: WorkspaceTemplate, observe?: 'events', reportProgress?: boolean, options?: {httpHeaderAccept?: 'application/json' | 'application/octet-stream'}): Observable<HttpEvent<WorkspaceTemplate>>;
    public updateWorkspaceTemplate(namespace: string, uid: string, body: WorkspaceTemplate, observe: any = 'body', reportProgress: boolean = false, options?: {httpHeaderAccept?: 'application/json' | 'application/octet-stream'}): Observable<any> {
        if (namespace === null || namespace === undefined) {
            throw new Error('Required parameter namespace was null or undefined when calling updateWorkspaceTemplate.');
        }
        if (uid === null || uid === undefined) {
            throw new Error('Required parameter uid was null or undefined when calling updateWorkspaceTemplate.');
        }
        if (body === null || body === undefined) {
            throw new Error('Required parameter body was null or undefined when calling updateWorkspaceTemplate.');
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

        return this.httpClient.put<WorkspaceTemplate>(`${this.configuration.basePath}/apis/v1beta1/${encodeURIComponent(String(namespace))}/workspace_templates/${encodeURIComponent(String(uid))}`,
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
