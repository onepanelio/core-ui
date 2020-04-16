/**
 * Onepanel Core
 * Onepanel Core project API
 *
 * The version of the OpenAPI document: 1.0.0-beta1
 * 
 *
 * NOTE: This class is auto generated by OpenAPI Generator (https://openapi-generator.tech).
 * https://openapi-generator.tech
 * Do not edit the class manually.
 */
import { KeyValue } from './keyValue';
import { WorkflowExecutionParameter } from './workflowExecutionParameter';
import { WorkflowTemplate } from './workflowTemplate';


export interface WorkflowExecution { 
    createdAt?: string;
    uid?: string;
    name?: string;
    phase?: string;
    startedAt?: string;
    finishedAt?: string;
    manifest?: string;
    parameters?: Array<WorkflowExecutionParameter>;
    workflowTemplate?: WorkflowTemplate;
    labels?: Array<KeyValue>;
}

