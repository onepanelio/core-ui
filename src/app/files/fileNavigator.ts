import { EventEmitter } from "@angular/core";
import { ListFilesResponse, ModelFile, WorkflowServiceService } from "../../api";

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
    files: Array<ModelFile> = [];

    constructor(args: FileNavigatorArgs) {
        this.workflowService = args.workflowService;
        this._rootPath = args.rootPath;
        this.path = new SlowValue<string>(args.rootPath);
        this.namespace = args.namespace;
        this.name = args.name;

        this.pathValueChangedSubscription = this.path.valueChanged.subscribe( (change) => {
            this.onPathValueChanged(change);
        })
    }

    protected onPathValueChanged(change: SlowValueUpdate<string>) {
        console.log(change);

        this.loadFiles();
    }

    goUpDirectory() {
        // @todo if at root, don't
        if(this.isRoot()) {
            return;
        }

        // otherwise...
    }

    isRoot(): boolean {
        return this.path.value == this._rootPath;
    }

    get rootPath(): string {
        return this._rootPath;
    }

    loadFiles() {
        this.workflowService.listFiles(this.namespace, this.name, this.path.value)
            .subscribe((response: ListFilesResponse) => {
                this.files = response.files;
            });
    }


    cleanUp() {
        this.pathValueChangedSubscription.unsubscribe();
    }
}
