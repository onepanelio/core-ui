import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FileNavigator } from "../fileNavigator";
import { ModelFile } from "../../../api";
import { GenericFileViewComponent } from '../file-viewer/generic-file-view/generic-file-view.component';

export type FileAction = 'download';

export interface FileActionEvent {
  action: FileAction;
  file: ModelFile;
}

@Component({
  selector: 'app-file-navigator',
  templateUrl: './file-navigator.component.html',
  styleUrls: ['./file-navigator.component.scss']
})
export class FileNavigatorComponent implements OnInit {
  @Input() displayedColumns = ['icon', 'name', 'last-modified', 'size', 'actions'];

  // tslint:disable-next-line:variable-name
  private _fileNavigator: FileNavigator;


  @Input() set fileNavigator(fileNavigator: FileNavigator) {
    if (!fileNavigator) {
      return;
    }

    this._fileNavigator = fileNavigator;
    this._fileNavigator.loadFiles();
  }
  get fileNavigator(): FileNavigator {
    return this._fileNavigator;
  }

  @Output() fileAction = new EventEmitter<FileActionEvent>();
  constructor() { }

  ngOnInit() {
  }

  onFileClick(file: ModelFile) {
    this.fileNavigator.selectFile(file);
  }

  onFileDownload(file: ModelFile) {
    this.fileAction.emit({
      action: 'download',
      file,
    });
  }

  canDownload(file: ModelFile) {
    return !file.directory &&
            parseInt(file.size, 10) < GenericFileViewComponent.MAX_DOWNLOAD_SIZE
    ;
  }
}
