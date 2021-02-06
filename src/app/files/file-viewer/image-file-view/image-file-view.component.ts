import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { ModelFile } from '../../../../api';
import { FileApi } from '../../file-api';

@Component({
  selector: 'app-image-file-view',
  templateUrl: './image-file-view.component.html',
  styleUrls: ['./image-file-view.scss'],
})
export class ImageFileViewComponent implements OnInit {
  @Input() file: ModelFile;
  @Output() loading = new EventEmitter<boolean>();
  @Input() fileApi: FileApi;

  displayContent: string;

  constructor() {
  }

  ngOnInit() {
    this.loading.emit(true);

    if (this.fileApi) {
      this.fileApi.getContent(this.file.path)
          .subscribe(res => {
            this.setBase64Content(res.data);
          }, err => {
            console.error(err);
          }, () => {
            this.loading.emit(false);
          });
    }
  }

  public static CanEdit(): boolean {
    return false;
  }

  public static Supports(file: ModelFile): boolean {
    return ImageFileViewComponent.IsImageExtension(file.extension);
  }

  public static IsImageExtension(extension: string){
    return (/(gif|jpg|jpeg|tiff|png)$/i).test(extension);
  }

  private setBase64Content(content: any) {
    let extension = this.file.extension;
    if (!extension) {
      extension = 'png';
    }

    this.displayContent = `data:image/${extension};base64,${content}`;
  }
}
