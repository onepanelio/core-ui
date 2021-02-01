import { Component, Input, EventEmitter, Output } from '@angular/core';

import { ImageFileViewComponent } from '../image-file-view/image-file-view.component';
import { ModelFile } from '../../../../api';
import { FileActionEvent } from '../../file-navigator/file-navigator.component';
import { TextFileViewComponent } from '../text-file-view/text-file-view.component';

@Component({
    selector: 'app-generic-file-view',
    templateUrl: './generic-file-view.component.html',
    styleUrls: ['./generic-file-view.component.scss'],
})
export class GenericFileViewComponent {
    public static BIG_FILE_SIZE = 5 * 1024 * 1024; // 5 MB
    public static MAX_IMAGE_FILE_SIZE = 10 * 1024 * 1024; // 10 MB
    public static MAX_DOWNLOAD_SIZE = 10 * 1024 * 1024; // 10 MB

    fileType = 'unknown';

    // tslint:disable-next-line:variable-name
    _file: ModelFile = null;

    @Input() showDownload = true;
    @Output() actionClick = new EventEmitter<FileActionEvent>();

    public static IsFileTooBigToDisplay(file: ModelFile): boolean {
        let size = 0;
        if (file.size) {
            size = parseInt(file.size, 10);
        }

        if (ImageFileViewComponent.Supports(file)) {
            return size > GenericFileViewComponent.MAX_IMAGE_FILE_SIZE;
        }

        return size > GenericFileViewComponent.BIG_FILE_SIZE;
    }

    constructor() {
    }

    @Input() set file(file: ModelFile) {
        this._file = file;
        this.fileType = this.getFileType();
    }

    @Input() namespace: string;
    @Input() name: string;
    @Output() loading = new EventEmitter<boolean>();

    getFileType(): string {
        this.loading.emit(false);
        const extension = this._file.extension;

        if (GenericFileViewComponent.IsFileTooBigToDisplay(this._file)) {
            return 'big-file';
        }

        if (extension.includes('zip') || extension.includes('gz')) {
            return 'big-file';
        }

        if (ImageFileViewComponent.Supports(this._file)) {
            return 'image';
        }

        if (TextFileViewComponent.Supports(this._file)) {
            return 'text';
        }

        return 'big-file';
    }

    onLoadingChange(value: boolean) {
        this.loading.emit(value);
    }

    onFileAction(e: FileActionEvent) {
        this.actionClick.emit(e);
    }
}
