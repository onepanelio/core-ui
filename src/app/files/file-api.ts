import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { ArtifactResponse, GetPresignedUrlResponse, ListFilesResponse } from '../../api';

export interface PaginatedListFilesResponse {
    count: number;
    totalCount: number;
    page: number;
    pages: number;
    files: any[];
    parentPath: string;
}

export interface PaginationOptions {
    page: number;
    perPage: number;
}

export interface FileApi {
    listFiles(path: string, pagination?: PaginationOptions): Observable<PaginatedListFilesResponse>;
    getContent(path: string): Observable<GetPresignedUrlResponse|string>;
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

    public listFiles(path: string, pagination?: PaginationOptions) {
        if (!path.startsWith('/')) {
            path = '/' + path;
        }

        const params = new URLSearchParams();
        const encodedPath = encodeURIComponent(path);
        params.append('path', encodedPath);
        if (pagination) {
            params.append('page', pagination.page.toString());
            params.append('per_page', pagination.perPage.toString());
        }

        params.append('tsp', Date.now().toString());

        const url = `${this.baseUrl}/api/files?${params.toString()}`;

        return this.getRequest(url);
    }

    public getContent(path: string): Observable<GetPresignedUrlResponse|string> {
        if (!path.startsWith('/')) {
            path = '/' + path;
        }

        const url = `${this.baseUrl}/api/files/content?path=${path}`;

        return of(url);
    }
}
