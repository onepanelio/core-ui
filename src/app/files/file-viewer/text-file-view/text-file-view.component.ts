import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { ModelFile } from '../../../../api';
import 'brace/mode/json';
import { FileApi } from '../../file-api';
import { GenericFileViewComponent } from '../generic-file-view/generic-file-view.component';

@Component({
  selector: 'app-text-file-view',
  templateUrl: './text-file-view.component.html',
  styleUrls: ['./text-file-view.component.scss']
})
export class TextFileViewComponent implements OnInit {
  @Input() file: ModelFile;
  @Input() fileApi: FileApi;
  @Output() loading = new EventEmitter<boolean>();

  displayContent: string;
  renderMode = 'text';
  formattedExtension  = 'text';

  public static CanEdit(): boolean {
    return false;
  }

  public static Supports(file: ModelFile): boolean {
    return TextFileViewComponent.IsTextExtension(file.extension);
  }

  public static IsTextExtension(extension: string){
    return (/(txt|text|log|config|json|xml|yaml)$/i).test(extension);
  }

  constructor() {
  }

  ngOnInit() {
    this.loading.emit(true);

    this.formattedExtension = this.file.extension.toLowerCase();

    switch (this.formattedExtension) {
      case 'json':
        this.renderMode = 'json';
        break;
      case 'xml':
        this.renderMode = 'xml';
        break;
      case 'yaml':
        this.renderMode = 'yaml';
        break;
      default:
        this.renderMode = 'text';
        break;
    }

    if (this.fileApi) {
      this.fileApi.getContent(this.file.path)
          .subscribe(res => {
            if (typeof res === 'string' ) {
              this.displayContent = res;
            } else {
              if ( parseInt(res.size, 10) >= GenericFileViewComponent.MAX_TEXT_FILE_SIZE) {
                return;
              }

              fetch(res.url).then(innerRes => {
                return innerRes.text();
              }).then( content => {
                this.displayContent = content;
              });
            }
          }, err => {
            console.error(err);
          }, () => {
            this.loading.emit(false);
          });
    }
  }

  private setBase64Content(content: string) {
    const parsedContent = atob(content);

    if (this.formattedExtension  === 'json') {
      try {
        const rawJson = JSON.parse(parsedContent);
        this.displayContent = JSON.stringify(rawJson, null, 2);
      } catch (e) {
        this.displayContent = parsedContent;
      }
    } else {
      this.displayContent = parsedContent;
    }
  }
}
