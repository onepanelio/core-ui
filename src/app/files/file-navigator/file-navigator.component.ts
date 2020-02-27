import { Component, Input, OnInit } from '@angular/core';
import { FileNavigator } from "../fileNavigator";
import { ModelFile } from "../../../api";

@Component({
  selector: 'app-file-navigator',
  templateUrl: './file-navigator.component.html',
  styleUrls: ['./file-navigator.component.scss']
})
export class FileNavigatorComponent implements OnInit {
  private _fileNavigator: FileNavigator;

  @Input() set fileNavigator(fileNavigator: FileNavigator) {
    if(!fileNavigator) {
      return;
    }

    console.log(fileNavigator);
    this._fileNavigator = fileNavigator;

    this._fileNavigator.loadFiles();
    // todo set listeners
  }

  get fileNavigator(): FileNavigator {
    return this._fileNavigator;
  }

  constructor() { }

  ngOnInit() {
  }

  onFileClick(file: ModelFile) {
    this.fileNavigator.path.value = file.path;
  }
}
