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
            path: data.path,
            namespace: data.namespace,
            name: 'dialog',
            workflowService: this.workflowServiceService,
            displayRootPath: data.displayRootPath,
        });
    }

    ngOnInit() {

    }

    handleCancel() {
        this.dialogRef.close();
    }

    handleConfirm() {
        const file = this.fileNavigator.file.value;

        if (!file.directory) {
            this.alertService.storeAlert(new Alert({
                type: 'danger',
                message: 'Current selection is a file, not a folder'
            }));

            return;
        }

        this.dialogRef.close( '/' + file.path);
    }
}
