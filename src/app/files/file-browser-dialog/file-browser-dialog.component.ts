import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { FileNavigator } from '../fileNavigator';
import { WorkflowServiceService } from '../../../api';
import { AlertService } from '../../alert/alert.service';
import { Alert } from '../../alert/alert';

export interface FileBrowserDialogData {
    namespace: string;
    path: string;
    displayRootPath?: string;
}

@Component({
    selector: 'app-filebrowser-dialog',
    templateUrl: './file-browser-dialog.component.html',
    styleUrls: ['./file-browser-dialog.component.scss']
})
export class FileBrowserDialogComponent implements OnInit {
    fileNavigator: FileNavigator;
    namespace: string;

    constructor(
        private alertService: AlertService,
        private workflowServiceService: WorkflowServiceService,
        public dialogRef: MatDialogRef<FileBrowserDialogComponent>,
        @Inject(MAT_DIALOG_DATA) public data: FileBrowserDialogData
    ) {
        this.namespace = data.namespace;

        this.fileNavigator = new FileNavigator({
            rootPath: '/',
            displayRootPath: data.displayRootPath,
            path: data.path,
            namespace: data.namespace,
            name: 'dialog',
            workflowService: this.workflowServiceService,
        });
    }

    ngOnInit() {

    }

    handleCancel() {
        this.dialogRef.close();
    }

    handleConfirm() {
        const file = this.fileNavigator.file.value;

        // If you do not change the directory while in the browser, the root is not considered a directory
        // but it is, so we need to return the result as just the root.
        if (file.path === '/') {
            this.dialogRef.close( '');
            return;
        } else if (!file.directory) {
            this.alertService.storeAlert(new Alert({
                type: 'danger',
                message: 'Current selection is a file, not a folder'
            }));

            return;
        }

        this.dialogRef.close(file.path);
    }
}
