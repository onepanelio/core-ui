import { EventEmitter, Output } from "@angular/core";
import { ListFilesResponse, ModelFile, WorkflowServiceService } from "../../api";
import { map } from "rxjs/operators";

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
    private _value: T;
    get value(): T {
        return this._value;
    }

    set value(val: T) {
        if(!this._valueChanging) {
            this.requestValueChange();
        }

        this.reportValueChange(val);
    }

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
            error: error,
        });
    }

    public constructor(value: T) {
        this._value = value;
    }
}

export interface FileNavigatorArgs {
    workflowService: WorkflowServiceService;
    rootPath: string;
    directory?: boolean;
    namespace: string;
    name: string;
}

export class FileNavigator {
    private namespace: string;
    private name: string;
    private pathValueChangedSubscription;
    private workflowService: WorkflowServiceService;

    private _rootPath: string;
    path: SlowValue<string>;
    file: SlowValue<ModelFile>;
    files?: Array<ModelFile>;

    @Output() filesChanged = new EventEmitter();

    constructor(args: FileNavigatorArgs) {
        this.workflowService = args.workflowService;
        this._rootPath = args.rootPath;
        this.path = new SlowValue<string>(args.rootPath);
        this.file = new SlowValue<ModelFile>({
           path: args.rootPath,
           directory: args.directory ? args.directory : false,
        });

        this.namespace = args.namespace;
        this.name = args.name;
    }

    goUpDirectory() {
        if(this.isRoot()) {
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
        this.path.value = file.path;

        if(file.directory) {
            this.loadFiles(file)
        } else {
            this.file.value = file;
        }
    }

    goToDirectory(path: string) {
        const fakeFile = {
            path: path,
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
        return this.path.value == this._rootPath;
    }

    get rootPath(): string {
        return this._rootPath;
    }

    loadFiles(file?: ModelFile) {
        if(file) {
            this.file.requestValueChange();
        }

        this.workflowService.listFiles(this.namespace, this.name, this.path.value)
            .pipe(
                map(value => {
                    if(!value.files) {
                        value.files = [];
                    }

                    for(let item of value.files) {
                        let dateItem = new Date(item.lastModified);

                        if(dateItem.getFullYear() < 2) {
                            item.lastModified = undefined;
                        }
                    }

                    if(this.path.value !== this.rootPath) {
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
                if(!response.files) {
                    response.files = [];
                }

                this.files = response.files;
                this.filesChanged.emit();

                if(file) {
                    this.file.value = file;
                }
            });
    }


    cleanUp() {
    }
}
