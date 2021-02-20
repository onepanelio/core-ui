import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { FileNavigator, LongRunningTaskState, SlowValueUpdate } from '../fileNavigator';
import { FileActionEvent } from '../file-navigator/file-navigator.component';
import { ModelFile, WorkflowServiceService } from '../../../api';
import { GenericFileViewComponent } from '../file-viewer/generic-file-view/generic-file-view.component';
import { MatSnackBar } from '@angular/material';

export type BreadcrumbGenerator = (path: string) => BreadcrumbPath;

export interface PathPart {
  display: string; // display value like 'mount'
  value: string; // internal value for the path part like 'mnt'
  partialPath: string; // full path up to this part like, '/mnt/data/test'
  clickable?: boolean; // if true, allow interaction.
  extraClass?: string;
}

export interface BreadcrumbPath {
  prefix?: string;
  postfix?: string;
  pathParts: PathPart[];
}

@Component({
  selector: 'app-file-browser',
  templateUrl: './file-browser.component.html',
  styleUrls: ['./file-browser.component.scss']
})
export class FileBrowserComponent implements OnInit, OnDestroy {
  private filePathChangedSubscriber;
  private fileChangedSubscriber;
  private changingFilesSubscriber;

  breadcrumbs: BreadcrumbPath;
  // @Input() breadcrumbGenerator: BreadcrumbGenerator;

  // tslint:disable-next-line:variable-name
  private _fileNavigator: FileNavigator;

  @Input() displayedColumns = [];

  showingFile = false;
  loading = false;

  // tslint:disable-next-line:variable-name
  _preRootName = '';

  // tslint:disable-next-line:variable-name
  _rootNameValue = '';

  // tslint:disable-next-line:variable-name
  _rootName = '';

  @Input() set rootName(value: string) {
    this._rootName = value;

    if (value.startsWith('/')) {
      this._preRootName = '/';
      this._rootNameValue = value.substring(1);
    } else {
      this._preRootName = undefined;
      this._rootNameValue = value;
    }
  }
  get rootName(): string {
    return this._rootName;
  }

  @Input() set fileNavigator(value: FileNavigator) {
    this._fileNavigator = value;

    if (this.filePathChangedSubscriber) {
      this.filePathChangedSubscriber.unsubscribe();
    }

    this.breadcrumbs = this.fileNavigator.breadcrumbGenerator(value.path.value);

    this.changingFilesSubscriber = value.changingFiles.valueChanged.subscribe((change: SlowValueUpdate<Array<ModelFile>>) => {
      if (change.state === LongRunningTaskState.Started) {
        setTimeout(() => {
          this.loading = true;
        });
      }

      if (change.state === LongRunningTaskState.Succeeded) {
        setTimeout(() => {
          this.loading = false;
        });
      }

      if (change.state === LongRunningTaskState.Failed) {
        setTimeout(() => {
          this.loading = false;
        });
      }
    });

    this.filePathChangedSubscriber = value.path.valueChanged.subscribe((change: SlowValueUpdate<string>)  => {
      if (change.state === LongRunningTaskState.Succeeded) {
        this.breadcrumbs = this.fileNavigator.breadcrumbGenerator(change.value);
      }
    });

    if (this.fileChangedSubscriber) {
      this.fileChangedSubscriber.unsubscribe();
    }

    this.fileChangedSubscriber = value.file.valueChanged.subscribe((change: SlowValueUpdate<ModelFile>) => {
      if (!this.showingFile && change.state === LongRunningTaskState.Started) {
        this.loading = true;
      }

      if (change.state === LongRunningTaskState.Succeeded) {
        this.updateFile(change.value);

        if (!this.showingFile) {
          this.loading = false;
        }
      }

      if (change.state === LongRunningTaskState.Failed) {
        if (!this.showingFile) {
          this.loading = false;
        }
      }
    });

    this.updatePathParts(this.fileNavigator.path.value);
  }
  get fileNavigator(): FileNavigator {
    return this._fileNavigator;
  }

  @Input() namespace: string;
  @Input() name: string;

  pathParts = [];

  constructor(
      private workflowService: WorkflowServiceService,
      private snackBar: MatSnackBar) { }

  ngOnInit() {
  }

  updatePathParts(path: string) {
    let subPath = path;
    if (this.fileNavigator.rootPath !== '/') {
      subPath = path.substring(this.fileNavigator.rootPath.length);
    }

    const newParts = subPath.split('/');
    this.pathParts = newParts.filter( value => value !== '');
  }

  updateFile(newFile: ModelFile) {
    if (newFile.directory) {
      this.showingFile = false;
      return;
    }

    this.showingFile = true;
  }

  ngOnDestroy(): void {
    if (this.filePathChangedSubscriber) {
      this.filePathChangedSubscriber.unsubscribe();
      this.filePathChangedSubscriber = null;
    }

    this.fileNavigator.cleanUp();
  }

  onFileEvent(e: FileActionEvent) {
    if (e.action === 'download') {
      this.onFileDownload(e.file);
    }
  }

  onFileDownload(file: ModelFile) {
    if (file.directory) {
      throw new Error('Unable to download a directory');
    }

    // this.workflowService.getArtifact(this.namespace, this.name, file.path)
    this.fileNavigator.getFileContent(file.path)
        .subscribe((res: any) => {
          const link = document.createElement('a') as HTMLAnchorElement;
          let downloadName = file.name;
          if (file.extension) {
            downloadName += `.${file.extension}`;
          }

          link.download = downloadName;

          link.href = 'data:application/octet-stream;charset=utf-16le;base64,' + res.data;

          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        });
  }

  onFileLoadingChange(value: boolean) {
    if (this.showingFile) {
      setTimeout(() => {
        this.loading = value;
      });
    }
  }

  canDownload(file: ModelFile) {
    return !file.directory &&
            parseInt(file.size, 10) < GenericFileViewComponent.MAX_DOWNLOAD_SIZE
    ;
  }

  copyLocationToClipboard() {
    let path = this._fileNavigator.file.value.path;
    if (!path) {
      path = ' ';
    }

    const selBox = document.createElement('textarea');
    selBox.style.position = 'fixed';
    selBox.style.left = '0';
    selBox.style.top = '0';
    selBox.style.opacity = '0';
    selBox.value = path;
    document.body.appendChild(selBox);
    selBox.focus();
    selBox.select();
    document.execCommand('copy');
    document.body.removeChild(selBox);

    this.snackBar.open('Copied to clipboard', 'OK', {
      duration: 2000
    });
  }

  handlePathPartClick(part: PathPart) {
    if (part.clickable) {
      this.fileNavigator.goToDirectory(part.partialPath);
    }
  }
}
