import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { ModelFile } from '../../../../api';
import { FileActionEvent } from '../../file-navigator/file-navigator.component';
import { GenericFileViewComponent } from '../generic-file-view/generic-file-view.component';

@Component({
  selector: 'app-big-file-view',
  templateUrl: './big-file-view.component.html',
  styleUrls: ['./big-file-view.component.scss']
})
export class BigFileViewComponent implements OnInit {
  // tslint:disable-next-line:variable-name
  _file: ModelFile = null;
  displayDownload = false;

  @Input() set file(value: ModelFile) {
    this._file = value;
    if (value.size) {
      const size = parseInt(value.size, 10);
      this.displayDownload = size < GenericFileViewComponent.MAX_DOWNLOAD_SIZE; // 10 MB limit
    } else {
      this.displayDownload = false;
    }
  }
  get file(): ModelFile {
    return this._file;
  }
  @Output() fileAction = new EventEmitter<FileActionEvent>();
  @Output() loading = new EventEmitter<boolean>();

  public static Supports(file: ModelFile): boolean {
    return true;
  }

  ngOnInit(): void {
    this.loading.emit(false);
  }

  onFileDownload() {
    this.fileAction.emit({
      file: this.file,
      action: 'download'
    });
  }
}
