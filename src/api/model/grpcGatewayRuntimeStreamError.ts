/**
 * Onepanel
 * Onepanel API
 *
 * The version of the OpenAPI document: 0.12.1
 * 
 *
 * NOTE: This class is auto generated by OpenAPI Generator (https://openapi-generator.tech).
 * https://openapi-generator.tech
 * Do not edit the class manually.
 */
import { GoogleProtobufAny } from './googleProtobufAny';


export interface GrpcGatewayRuntimeStreamError { 
    grpc_code?: number;
    http_code?: number;
    message?: string;
    http_status?: string;
    details?: Array<GoogleProtobufAny>;
}

