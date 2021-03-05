import { Injectable } from '@angular/core';
import { ConfigServiceService, GetConfigResponse } from '../../api';
import { map } from 'rxjs/operators';
import { of } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class ConfigService {
    private responseCache: GetConfigResponse;
    private responseCacheObtainedAt: Date = null;

    constructor(private configServiceService: ConfigServiceService) {
    }

    public getMachineTypeByValue(value: string) {
        if (this.responseCache && this.responseCacheObtainedAt) {
            const now = new Date();
            const difference = now.getTime() - this.responseCacheObtainedAt.getTime();

            // 30 seconds
            if (difference < 30000) {
                const result = this.responseCache.nodePool.options.find(option => option.value === value)
                return of(result);
            }
        }

        return this.configServiceService.getConfig().pipe(
            map(res => {
                    this.responseCache = res;
                    this.responseCacheObtainedAt = new Date();
                    return res.nodePool.options.find(option => option.value === value);
                }
            ));
    }

    public getNodePoolLabel() {
        if (this.responseCache && this.responseCacheObtainedAt) {
            const now = new Date();
            const difference = now.getTime() - this.responseCacheObtainedAt.getTime();

            // 90 seconds
            if (difference < 90000) {
                const result = this.responseCache.nodePool.label;
                return of(result);
            }
        }

        return this.configServiceService.getConfig().pipe(
            map(res => {
                    this.responseCache = res;
                    this.responseCacheObtainedAt = new Date();
                    return res.nodePool.label;
                }
            ));
    }
}
