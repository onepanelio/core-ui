import { FileApi } from './file-api';
import { Observable } from 'rxjs';
import { ArtifactResponse, ListFilesResponse, WorkflowServiceService } from '../../api';

export class WorkflowFileApiWrapper implements FileApi {
    constructor(
        private namespace: string,
        private uid: string,
        private workflowService: WorkflowServiceService) {
    }

    listFiles(path: string): Observable<ListFilesResponse> {
        return this.workflowService.listFiles(this.namespace, this.uid, path);
    }

    getContent(path: string): Observable<ArtifactResponse|string> {
        return this.workflowService.getArtifact(this.namespace, this.uid, path);
    }
}
