import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { ModelFile, WorkflowServiceService } from '../../../../api';
import 'brace/mode/json';

@Component({
  selector: 'app-text-file-view',
  templateUrl: './text-file-view.component.html',
  styleUrls: ['./text-file-view.component.scss']
})
export class TextFileViewComponent implements OnInit {
  @Input() namespace: string;
  @Input() name: string;
  @Input() file: ModelFile;
  @Output() loading = new EventEmitter<boolean>();

  displayContent: string;
  renderMode = 'text';
  formattedExtension  = 'text';

  constructor(private workflowService: WorkflowServiceService) {
  }

  ngOnInit() {
    this.loading.emit(true);

    this.formattedExtension = this.file.extension.toLowerCase();

    switch (this.formattedExtension) {
      case 'json':
        this.renderMode = 'json';
        break;
      case 'yaml':
        this.renderMode = 'yaml';
        break;
      default:
        this.renderMode = 'text';
        break;
    }

    this.workflowService.getArtifact(this.namespace, this.name, this.file.path)
        .subscribe(res => {
          this.setBase64Content(res.data);
        }, err => {
          console.error(err);
        }, () => {
          this.loading.emit(false);
        });
  }

  public static CanEdit(): boolean {
    return false;
  }

  public static Supports(file: ModelFile): boolean {
    return TextFileViewComponent.IsTextExtension(file.extension);
  }

  public static IsTextExtension(extension: string){
    return (/(txt|text|log|config|json|yaml)$/i).test(extension);
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
