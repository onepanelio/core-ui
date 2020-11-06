import { Injectable } from '@angular/core';
import { AuthServiceService } from '../../api';
import { combineLatest } from 'rxjs';
import { map } from 'rxjs/operators';
import { Permissions } from '../auth/models';

export type PermissionVerb = 'create' | 'get' | 'watch' | 'list' | 'delete' | 'update';

@Injectable({
    providedIn: 'root'
})
export class PermissionService {
    constructor(private authServiceService: AuthServiceService) {}

    /**
     * Combines requests into one call and maps the result into a Permissions object.
     * requests and verbs are expected to be in the same order.
     * That is, the request for verb i is as index i.
     */
    private getPermissionsRequest(requests: any[], verbs: PermissionVerb[]) {
        if (verbs.length === 0) {
           throw new Error('No verbs');
        }

        return combineLatest(requests).pipe(
            map(items => {
                    if (!items) {
                        return new Permissions();
                    }

                    const result = new Permissions();

                    for (let i = 0; i < items.length; i++) {
                        const resItem: any = items[i];
                        const verb = verbs[i];
                        result[verb] = resItem.authorized;
                    }

                    return result;
                }
            ));
    }

    getWorkflowPermissions(namespace: string, resourceName: string, ...verbs: PermissionVerb[]) {
        const requests = [];

        for (const verb of verbs) {
            requests.push(
                this.authServiceService.isAuthorized({
                    namespace,
                    verb,
                    resource: 'workflows',
                    resourceName,
                    group: 'argoproj.io',
                })
            );
        }

        return this.getPermissionsRequest(requests, verbs);
    }

    getWorkspaceTemplatePermissions(namespace: string, resourceName: string, ...verbs: PermissionVerb[]) {
        const requests = [];

        for (const verb of verbs) {
            requests.push(
                this.authServiceService.isAuthorized({
                    namespace,
                    verb,
                    resource: 'workflowtemplates',
                    resourceName,
                    group: 'argoproj.io',
                })
            );
        }

        return this.getPermissionsRequest(requests, verbs);
    }

    getWorkspacePermissions(namespace: string, resourceName: string, ...verbs: PermissionVerb[]) {
        const requests = [];

        for (const verb of verbs) {
            requests.push(
                this.authServiceService.isAuthorized({
                    namespace,
                    verb,
                    resource: 'workspaces',
                    resourceName,
                    group: 'onepanel.io',
                })
            );
        }

        return this.getPermissionsRequest(requests, verbs);
    }
}
