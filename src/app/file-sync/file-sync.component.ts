import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { Workspace, WorkspaceComponent, WorkspaceServiceService } from '../../api';
import * as yaml from 'js-yaml';
import { MatDialog } from '@angular/material/dialog';
import { FileBrowserDialogComponent, FileBrowserDialogData } from '../files/file-browser-dialog/file-browser-dialog.component';
import { AbstractControl, FormBuilder, FormGroup } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../auth/auth.service';
import { SimpleLogComponent } from '../simple-log/simple-log.component';
import { environment } from '../../environments/environment';

type syncAction = 'upload' | 'download';

interface SyncBody {
  action: syncAction;
  path: string;
  delete: boolean;
  prefix: string;
}

@Component({
  selector: 'app-file-sync',
  templateUrl: './file-sync.component.html',
  styleUrls: ['./file-sync.component.scss']
})
export class FileSyncComponent implements OnInit {
  @Input() namespace: string;
  @Input() workspace: Workspace;
  @ViewChild(SimpleLogComponent, {static: false}) log: SimpleLogComponent;
  @ViewChild('objectStorageInput', {static: true}) objectStorageInput: ElementRef;

  form: FormGroup;
  objectStoragePath: AbstractControl;
  mountPath: AbstractControl;
  mountPathInput: AbstractControl;
  deleteFilesInDestination: AbstractControl;

  mountPaths: string[] = [];
  showLogs = false;

  editingObjectStorage = false;

  constructor(
      private authService: AuthService,
      private dialog: MatDialog,
      private formBuilder: FormBuilder,
      private httpClient: HttpClient) { }

  ngOnInit() {
    const volumeMounts = this.parseVolumeMountsFromManifest(this.workspace.workspaceTemplate.manifest);
    const mountPaths = [];
    for (const volumeMount of volumeMounts) {
      mountPaths.push(volumeMount.mountPath);
    }

    this.mountPaths = mountPaths;

    this.form = this.formBuilder.group({
      objectStoragePath: [],
      mountPath: [],
      mountPathInput: [],
      deleteFilesInDestination: [],
    });

    this.objectStoragePath = this.form.get('objectStoragePath');
    this.mountPath = this.form.get('mountPath');
    this.mountPathInput = this.form.get('mountPathInput');
    this.deleteFilesInDestination = this.form.get('deleteFilesInDestination');
    this.deleteFilesInDestination.setValue(false);

    if (mountPaths.length !== 0) {
      this.mountPath.setValue(mountPaths[0]);
    }

    this.objectStoragePath.setValue('/');
  }

  parseVolumeMountsFromManifest(manifest: string): Array<{name: string, mountPath: string}> {
    const data = yaml.safeLoad(manifest);
    const fileSyncerContainer = data.containers.find(container => container.name === 'sys-filesyncer');
    const volumeMounts = [];

    for (const volumeMount of fileSyncerContainer.volumeMounts) {
      if (volumeMount.name.indexOf('sys-') > -1) {
        continue;
      }

      volumeMounts.push(volumeMount);
    }

    return volumeMounts;
  }

  handleBrowse() {
    let path: string = this.objectStoragePath.value;
    if (!path) {
      path = '/';
    }

    if (path !== '/' && path.startsWith('/')) {
      path = path.substring(1);
    }

    const data: FileBrowserDialogData = {
      namespace: this.namespace,
      path,
    };

    const dialog = this.dialog.open(FileBrowserDialogComponent, {
      width: '60vw',
      maxHeight: '100vh',
      data
    });

    dialog.afterClosed().subscribe((res: string|undefined) => {
      if (!res) {
        return;
      }

      this.objectStoragePath.setValue(res);
    });
  }

  private getFinalObjectStoragePath() {
    // Skip the first character because it will be a '/' and API doesn't want that.
    return this.objectStoragePath.value.substring(1);
  }

  private getPostData(action: syncAction): SyncBody {
    let path = this.mountPath.value + '/';
    if (this.mountPathInput.value) {
      path += this.mountPathInput.value;
    }

    return {
      action,
      path,
      delete: this.deleteFilesInDestination.value,
      prefix: this.getFinalObjectStoragePath()
    };
  }

  private syncRequest(body: SyncBody) {
    const filesyncer = this.workspace.workspaceComponents.find((workspace: WorkspaceComponent) => {
      return workspace.name === 'sys-filesyncer';
    });

    const url = filesyncer.url + '/api/sync';

    return this.httpClient.post(url, body,
        {
          headers: {
            'onepanel-auth-token': this.authService.getAuthToken()
          }
        });
  }

  handleSyncToObjectStorage() {
    const now = new Date();

    const body = this.getPostData('upload');
    this.syncRequest(body).subscribe(res => {
      this.watchLogs(now);
    }, err => {
      console.error(err);
    });
  }

  handleSyncToWorkspace() {
    const now = new Date();

    const body = this.getPostData('download');
    this.syncRequest(body).subscribe(res => {
      this.watchLogs(now);
    }, err => {
      console.error(err);
    });
  }

  /**
   * @param sinceTime timestamp indicating from what point the logs should be watched.
   */
  watchLogs(sinceTime: Date) {
    this.showLogs = true;
    const sinceEpochSeconds = Math.floor(sinceTime.getTime() / 1000);
    const url = `${environment.baseWsUrl}/apis/v1beta1/${this.namespace}/workspaces/${this.workspace.uid}/containers/sys-filesyncer/logs?sinceTime=${sinceEpochSeconds}`;
    this.log.start(url);
  }

  handleLogsClose() {
    this.log.clear();
    setTimeout(() => {
      this.showLogs = false;
    }, 100);
  }

  handleEditObjectStoragePath() {
    this.editingObjectStorage = true;
    setTimeout(() => {
      this.objectStorageInput.nativeElement.focus();
    }, 100);
  }

  handleStopEditObjectStoragePath() {
    this.editingObjectStorage = false;

    const path: string = this.objectStoragePath.value;
    if (!path) {
      this.objectStoragePath.setValue('/');
    } else if (!path.endsWith('/')) {
      this.objectStoragePath.setValue(path + '/');
    }
  }
}
