import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { FileNavigator, LongRunningTaskState, SlowValueUpdate } from '../fileNavigator';
import { AlertService } from '../../alert/alert.service';
import { Alert } from '../../alert/alert';
import { FileApi } from '../file-api';
import { BreadcrumbPath, PathPart } from '../file-browser/file-browser.component';

export interface FileBrowserDialogData {
    namespace: string;
    name: string;
    path: string;
    prefix?: string;
    preParts: string[];
    apiService: FileApi;
    rootPath?: string;
}

@Component({
    selector: 'app-filebrowser-dialog',
    templateUrl: './file-browser-dialog.component.html',
    styleUrls: ['./file-browser-dialog.component.scss']
})
export class FileBrowserDialogComponent implements OnInit {
    fileNavigator: FileNavigator;
    namespace: string;
    allowRoot: boolean;
    private prefix?: string;
    private preParts = new Array<string>();

    constructor(
        private alertService: AlertService,
        public dialogRef: MatDialogRef<FileBrowserDialogComponent>,
        @Inject(MAT_DIALOG_DATA) public data: FileBrowserDialogData
    ) {
        this.namespace = data.namespace;
        this.prefix = data.prefix;
        this.preParts = data.preParts;

        const rootPath = data.rootPath ? data.rootPath : '/';

        this.fileNavigator = new FileNavigator({
            rootPath,
            path: data.path,
            namespace: data.namespace,
            name: data.name,
            apiService: data.apiService,
            generator: (path: string): BreadcrumbPath => {
                return this.makeBreadcrumbs(path);
            }
        });
    }

    ngOnInit() {
    }

    handleCancel() {
        this.dialogRef.close();
    }

    handleConfirm() {
        const path = this.fileNavigator.path.value;

        const isDirectory = path.endsWith('/');

        if (!isDirectory) {
            this.alertService.storeAlert(new Alert({
                type: 'danger',
                message: 'Current selection is a file, not a folder'
            }));

            return;
        }

        this.dialogRef.close(path);
    }

    public makeBreadcrumbs(path: string): BreadcrumbPath {
        const parts = path.split('/').filter(value => value !== '');
        let pathSum = '';
        if (this.prefix) {
            pathSum += this.prefix;
        }

        const pathParts: PathPart[] = [];
        for (const part of this.preParts) {
            pathParts.push({
                display: part,
                value: part,
                partialPath: '/',
                clickable: parts.length > 0,
            });
        }

        let i = 0;
        for (const part of parts) {
            const clickable = parts.length > 1 || this.preParts.length > 0;

            if (i !== 0) {
                pathSum += '/';
            }

            pathSum += part;

            pathParts.push({
                display: part,
                value: part,
                partialPath: pathSum,
                clickable,
            });

            i++;
        }

        const lastPathPart = pathParts[pathParts.length - 1];
        lastPathPart.clickable = false;

        const isFile = lastPathPart.value.indexOf('.') > -1;

        return {
            prefix: this.prefix,
            pathParts,
            postfix: isFile ? undefined : '/'
        };
    }
}
