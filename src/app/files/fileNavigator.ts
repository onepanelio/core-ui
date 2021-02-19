import { EventEmitter, Output } from '@angular/core';
import { ListFilesResponse, ModelFile, WorkflowServiceService } from '../../api';
import { map } from 'rxjs/operators';
import { FileApi } from './file-api';
import { BreadcrumbGenerator } from './file-browser/file-browser.component';

export enum LongRunningTaskState {
    Started = 0,
    Succeeded = 1,
    Failed = 2,
}

export interface SlowValueUpdate<T> {
    state: LongRunningTaskState;
    value: T;
    error?: any;
}

export class SlowValue<T> {
    // tslint:disable-next-line:variable-name
    private _value: T;
    get value(): T {
        return this._value;
    }

    set value(val: T) {
        if (!this._valueChanging) {
            this.requestValueChange();
        }

        this.reportValueChange(val);
    }

    // tslint:disable-next-line:variable-name
    private _valueChanging = false;
    get valueChanging(): boolean {
        return this._valueChanging;
    }

    /**
     * Emitted when the value is being changed.
     */
    valueChanged = new EventEmitter<SlowValueUpdate<T>>();

    requestValueChange() {
        this._valueChanging = true;

        this.valueChanged.emit({
            state: LongRunningTaskState.Started,
            value: this._value,
        });
    }

    reportValueChange(val: T) {
        this._value = val;
        this._valueChanging = false;

        this.valueChanged.emit({
            state: LongRunningTaskState.Succeeded,
            value: val,
        });
    }

    reportValueChangeFailed(error?: any ) {
        this._valueChanging = false;

        this.valueChanged.emit({
            state: LongRunningTaskState.Failed,
            value: this._value,
            error,
        });
    }

    public constructor(value: T) {
        this._value = value;
    }
}

export interface FileNavigatorArgs {
    apiService: FileApi;
    rootPath: string;
    path?: string;
    displayRootPath?: string;
    directory?: boolean;
    namespace: string;
    name: string;
    timer?: boolean;
    generator: BreadcrumbGenerator;
}

export class FileNavigator {
    private namespace: string;
    public name: string;
    private pathValueChangedSubscription;
    apiService: FileApi;

    // tslint:disable-next-line:variable-name
    private _rootPath: string;

    path: SlowValue<string>;
    file: SlowValue<ModelFile>;
    changingFiles: SlowValue<Array<ModelFile>>;
    files?: Array<ModelFile>;

    @Output() filesChanged = new EventEmitter();

    timer: any;
    breadcrumbGenerator: BreadcrumbGenerator;

    constructor(args: FileNavigatorArgs) {
        this.apiService = args.apiService;
        this._rootPath = args.rootPath;
        this.breadcrumbGenerator = args.generator;

        const initialPath = args.path ? args.path : args.rootPath;

        this.path = new SlowValue<string>(initialPath);
        this.file = new SlowValue<ModelFile>({
           path: args.rootPath,
           directory: args.directory ? args.directory : false,
        });

        this.changingFiles = new SlowValue<Array<ModelFile>>([]);

        this.namespace = args.namespace;
        this.name = args.name;

        if (args.timer) {
            this.timer = setInterval(() => {
                this.loadFiles();
            }, 5000);
        }
    }

    public static cleanUp(fileNavigators: FileNavigator[]) {
        for (const fileNavigator of fileNavigators) {
            fileNavigator.cleanUp();
        }
    }

    get hasFiles(): boolean {
        return this.files && this.files.length && this.files.length > 0;
    }

    goUpDirectory() {
        if (this.isRoot()) {
            return;
        }

        const pathString = this.path.value;
        const lastSlashIndex = pathString.lastIndexOf('/');
        const containingDirectoryPath = pathString.substring(0, lastSlashIndex);

        const fakeFile = {
            path: containingDirectoryPath,
            directory: true,
        };

        this.selectFile(fakeFile);
    }

    selectFile(file: ModelFile) {
        let path = file.path;
        if (file.directory && !file.path.endsWith('/')) {
            path += '/';
        }

        this.path.value = path;

        if (file.directory) {
            this.loadFiles(file);
        } else {
            this.file.value = file;
        }
    }

    goToDirectory(path: string) {
        const fakeFile = {
            path,
            directory: true
        };

        this.selectFile(fakeFile);
    }

    goToRoot() {
        const fakeFile = {
            path: this.rootPath,
            directory: true,
        };

        this.selectFile(fakeFile);
    }

    isRoot(): boolean {
        return this.path.value === this._rootPath;
    }

    get rootPath(): string {
        return this._rootPath;
    }

    loadFiles(file?: ModelFile) {
        if (file) {
            this.file.requestValueChange();
        } else {
            this.changingFiles.requestValueChange();
        }

        this.apiService.listFiles(this.path.value)
            .pipe(
                map(value => {
                    if (!value.files) {
                        value.files = [];
                    }

                    for (const item of value.files) {
                        const dateItem = new Date(item.lastModified);

                        if (dateItem.getFullYear() < 2) {
                            item.lastModified = undefined;
                        }
                    }

                    if (this.path.value !== this.rootPath &&
                        this.path.value !== (this.rootPath + '/')) {
                        const fileUp = {
                            path: value.parentPath,
                            directory: true,
                            name: '..'
                        };

                        value.files.unshift(fileUp);
                    }

                    return value;
                })
            )
            .subscribe((response: ListFilesResponse) => {
                if (!response.files) {
                    response.files = [];
                }

                this.files = response.files;
                this.changingFiles.reportValueChange(response.files);
                this.filesChanged.emit();

                if (file) {
                    this.file.value = file;
                }
            })
        ;
    }

    public getFileContent(path: string) {
        return this.apiService.getContent(path);
    }

    cleanUp() {
        if (this.timer) {
            clearInterval(this.timer);
        }
    }
}
