import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { FileNavigator, LongRunningTaskState, SlowValueUpdate } from "../fileNavigator";
import { BreadcrumbEvent } from "../../breadcrumbs/breadcrumbs.component";
import { FileActionEvent } from "../file-navigator/file-navigator.component";
import { ModelFile, WorkflowServiceService } from "../../../api";

@Component({
  selector: 'app-file-browser',
  templateUrl: './file-browser.component.html',
  styleUrls: ['./file-browser.component.scss']
})
export class FileBrowserComponent implements OnInit, OnDestroy {
  private filePathChangedSubscriber;
  private fileChangedSubscriber;
  private _fileNavigator: FileNavigator;

  showingFile = false;

  @Input() rootName: string = '';
  @Input() set fileNavigator(value: FileNavigator) {
    this._fileNavigator = value;

    if(this.filePathChangedSubscriber) {
      this.filePathChangedSubscriber.unsubscribe();
    }

    this.filePathChangedSubscriber = value.path.valueChanged.subscribe((change: SlowValueUpdate<string>)  => {
      if(change.state === LongRunningTaskState.Succeeded) {
        this.updatePathParts(change.value);
      }
    });

    if(this.fileChangedSubscriber) {
      this.fileChangedSubscriber.unsubscribe();
    }

    this.fileChangedSubscriber = value.file.valueChanged.subscribe((change: SlowValueUpdate<ModelFile>) => {
      if(change.state === LongRunningTaskState.Succeeded) {
        this.updateFile(change.value);
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

  constructor(private workflowService: WorkflowServiceService) { }

  ngOnInit() {
  }

  updatePathParts(path: string) {
    const subPath = path.substring(this.fileNavigator.rootPath.length);
    const newParts = subPath.split('/');
    this.pathParts = newParts.filter( value => value !== '');
  }

  updateFile(newFile: ModelFile) {
    if(newFile.directory) {
      this.showingFile = false;
      return;
    }

    this.showingFile = true;
  }

  ngOnDestroy(): void {
    if(this.filePathChangedSubscriber) {
      this.filePathChangedSubscriber.unsubscribe();
      this.filePathChangedSubscriber = null;
    }
  }

  onBreadcrumbClicked(e: BreadcrumbEvent) {
    const path = this.getPathFromBreadcrumbIndex(e.index);
    this.fileNavigator.goToDirectory(path);
  }

  goToRoot() {
    this.fileNavigator.goToRoot();
  }

  private getPathFromBreadcrumbIndex(index: number): string {
    const path = this.fileNavigator.path.value;
    const subPath = path.substring(this.fileNavigator.rootPath.length);

    let parts = subPath.split('/').filter(value => value.length != 0);

    const partUntil = parts.slice(0, index + 1).join('/');

    return this.fileNavigator.rootPath + '/' + partUntil;
  }

  onFileEvent(e: FileActionEvent) {
    if(e.action === 'download') {
      this.onFileDownload(e.file);
    }
  }

  onFileDownload(file: ModelFile) {
    if(file.directory) {
      throw 'Unable to download a directory';
    }

    this.workflowService.getArtifact(this.namespace, this.name, file.path)
        .subscribe((res: any) => {
          const link = <HTMLAnchorElement>document.createElement('a');
          let downloadName = `${this.namespace}-${this.name}-${file.name}`;
          if(file.extension) {
            downloadName += `.${file.extension}`;
          }

          link.download = downloadName;

          link.href = 'data:application/octet-stream;charset=utf-16le;base64,' + res.data;

          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        })
  }
}
