/**
 * Onepanel
 * Onepanel API
 *
 * The version of the OpenAPI document: 0.19.0
 * 
 *
 * NOTE: This class is auto generated by OpenAPI Generator (https://openapi-generator.tech).
 * https://openapi-generator.tech
 * Do not edit the class manually.
 */
import { WorkspaceTemplate } from './workspaceTemplate';


export interface ListWorkspaceTemplatesResponse { 
    count?: number;
    workspaceTemplates?: Array<WorkspaceTemplate>;
    page?: number;
    pages?: number;
    totalCount?: number;
}

