import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ArtifactResponse, ListFilesResponse } from '../../api';

export interface FileApi {
    listFiles(path: string): Observable<ListFilesResponse>;
    getContent(path: string): Observable<ArtifactResponse>;
}

export class FileSyncerFileApi implements FileApi {
    constructor(
        private authToken: string,
        private httpClient: HttpClient,
        private baseUrl: string) {
    }

    private getRequest(url: string): any {
        return this.httpClient.get(url,
            {
                headers: {
                    'onepanel-auth-token': this.authToken
                }
            });
    }

    public listFiles(path: string) {
        if (!path.startsWith('/')) {
            path = '/' + path;
        }

        const encodedPath = encodeURIComponent(path);
        const url = `${this.baseUrl}/api/files?path=${encodedPath}`;

        return this.getRequest(url);
    }

    public getContent(path: string): Observable<ArtifactResponse> {
        if (!path.startsWith('/')) {
            path = '/' + path;
        }

        const url = `${this.baseUrl}/api/files/content?path=${path}`;

        return this.getRequest(url);
    }
}
