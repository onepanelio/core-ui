import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FileNavigator } from "../fileNavigator";
import { ModelFile } from "../../../api";

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

  private _fileNavigator: FileNavigator;


  @Input() set fileNavigator(fileNavigator: FileNavigator) {
    if(!fileNavigator) {
      return;
    }

    this._fileNavigator = fileNavigator;
    this._fileNavigator.loadFiles();
  }

  @Output() fileAction = new EventEmitter<FileActionEvent>();

  get fileNavigator(): FileNavigator {
    return this._fileNavigator;
  }

  constructor() { }

  ngOnInit() {
  }

  onFileClick(file: ModelFile) {
    this.fileNavigator.selectFile(file);
  }

  onFileDownload(file: ModelFile) {
    this.fileAction.emit({
      action: 'download',
      file: file,
    })
  }
}
