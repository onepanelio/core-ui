/**
 * Onepanel
 * Onepanel API
 *
 * The version of the OpenAPI document: 0.13.0
 * 
 *
 * NOTE: This class is auto generated by OpenAPI Generator (https://openapi-generator.tech).
 * https://openapi-generator.tech
 * Do not edit the class manually.
 */
import { Namespace } from './namespace';


export interface ListNamespacesResponse { 
    count?: number;
    namespaces?: Array<Namespace>;
    page?: number;
    pages?: number;
    totalCount?: number;
}

