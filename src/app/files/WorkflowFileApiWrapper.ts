import { FileApi, PaginatedListFilesResponse, PaginationOptions } from './file-api';
import { Observable } from 'rxjs';
import { ArtifactResponse, ListFilesResponse, WorkflowServiceService } from '../../api';
import { map } from 'rxjs/operators';

export class WorkflowFileApiWrapper implements FileApi {
    constructor(
        private namespace: string,
        private uid: string,
        private workflowService: WorkflowServiceService) {
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

        return this.workflowService
                   .listFiles(this.namespace, this.uid, path, pagination.page, pagination.perPage)
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

    getContent(path: string): Observable<ArtifactResponse|string> {
        return this.workflowService.getArtifact(this.namespace, this.uid, path);
    }
}
