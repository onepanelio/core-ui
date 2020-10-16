import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { ModelFile, WorkflowServiceService } from "../../../../api";
import { ImageFileViewComponent } from "../image-file-view/image-file-view.component";

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

  constructor(private workflowService: WorkflowServiceService) {
  }

  ngOnInit() {
    this.loading.emit(true);

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
    return (/(txt|text|log|config)$/i).test(extension);
  }

  private setBase64Content(content: string) {
    this.displayContent = atob(content);
  }
}
