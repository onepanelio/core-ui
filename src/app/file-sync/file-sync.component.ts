import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { ConfigServiceService, Workspace, WorkspaceComponent, WorkspaceServiceService } from '../../api';
import * as yaml from 'js-yaml';
import { MatDialog } from '@angular/material/dialog';
import { FileBrowserDialogComponent, FileBrowserDialogData } from '../files/file-browser-dialog/file-browser-dialog.component';
import { AbstractControl, FormBuilder, FormControl, FormGroup } from '@angular/forms';
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
  workspacePath: AbstractControl;
  deleteFilesInDestination: AbstractControl;

  mountPaths: string[] = [];
  showLogs = false;
  bucket = '';

  constructor(
      private authService: AuthService,
      private dialog: MatDialog,
      private formBuilder: FormBuilder,
      private httpClient: HttpClient,
      private configService: ConfigServiceService) { }

  ngOnInit() {
    this.configService.getNamespaceConfig(this.namespace).subscribe(res => {
      this.bucket = res.bucket;
    });

    this.form = this.formBuilder.group({
      objectStoragePath: [],
      workspacePath: [],
      deleteFilesInDestination: [],
    });

    this.objectStoragePath = this.form.get('objectStoragePath');
    this.workspacePath = this.form.get('workspacePath');
    this.deleteFilesInDestination = this.form.get('deleteFilesInDestination');
    this.deleteFilesInDestination.setValue(false);
    this.objectStoragePath.setValue('');

    const volumeMounts = this.parseVolumeMountsFromManifest(this.workspace.workspaceTemplate.manifest);
    const mountPaths = [];
    for (const volumeMount of volumeMounts) {
      mountPaths.push(volumeMount.mountPath);
    }

    this.mountPaths = mountPaths;


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
    const path: string = this.objectStoragePath.value;
    const data: FileBrowserDialogData = {
      namespace: this.namespace,
      path,
      displayRootPath: this.bucket
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

  private getPostData(action: syncAction): SyncBody {
    return {
      action,
      path: this.workspacePath.value,
      delete: this.deleteFilesInDestination.value,
      prefix: this.objectStoragePath.value
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

  handleStopEditObjectStoragePath() {
    const path: string = this.objectStoragePath.value;
    if (!path) {
      this.objectStoragePath.setValue('');
    } else if (!path.endsWith('/')) {
      this.objectStoragePath.setValue(path + '/');
    }
  }
}
