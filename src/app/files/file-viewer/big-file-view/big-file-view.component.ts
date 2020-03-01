import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { ModelFile } from "../../../../api";
import { FileAction, FileActionEvent } from "../../file-navigator/file-navigator.component";

@Component({
  selector: 'app-big-file-view',
  templateUrl: './big-file-view.component.html',
  styleUrls: ['./big-file-view.component.scss']
})
export class BigFileViewComponent implements OnInit {
  public static Supports(file: ModelFile): boolean {
    return true;
  }

  @Input() file: ModelFile = null;
  @Output() fileAction = new EventEmitter<FileActionEvent>();
  @Output() loading = new EventEmitter<boolean>();

  ngOnInit(): void {
    this.loading.emit(false);
  }

  onFileDownload() {
    this.fileAction.emit({
      file: this.file,
      action: 'download'
    })
  }
}
