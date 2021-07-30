import { FileApi, PaginatedListFilesResponse, PaginationOptions } from './file-api';
import { Observable } from 'rxjs';
import { FileServiceService, GetPresignedUrlResponse } from '../../api';
import { map } from 'rxjs/operators';

export class WorkflowFileApiWrapper implements FileApi {
    constructor(
        private namespace: string,
        private fileService: FileServiceService) {
    }

    public listFiles(path: string, pagination?: PaginationOptions): Observable<PaginatedListFilesResponse> {
        if (!path.startsWith('/')) {
            path = '/' + path;
        }

        if (!pagination) {
            pagination = {
                page: 1,
                perPage: 15
            };
        }

        return this.fileService
                   .listFiles(this.namespace, path, pagination.page, pagination.perPage)
                   .pipe(map(res => {
                       return {
                            count: res.count,
                            totalCount: res.totalCount,
                            page: res.page,
                            pages: res.pages,
                            parentPath: res.parentPath,
                            files: res.files,
                       };
                   }));
    }

    getContent(path: string): Observable<GetPresignedUrlResponse|string> {
        return this.fileService.getObjectDownloadPresignedUrl(this.namespace, path);
    }
}
