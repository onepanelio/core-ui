import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { AuthServiceService, Parameter, Workspace } from '../../../../api';
import { WorkspaceState } from '../workspace-view.component';
import { NamespaceTracker } from '../../../namespace/namespace-tracker.service';
import { PermissionService } from '../../../permissions/permission.service';
import { FormComponent } from '../../../fields/form/form.component';

@Component({
    selector: 'app-workspace-view-parameters',
    templateUrl: './workspace-view-parameters.component.html',
    styleUrls: ['./workspace-view-parameters.component.scss']
})
export class WorkspaceViewParametersComponent implements OnInit {
    @ViewChild(FormComponent, { static: false }) formComponent: FormComponent;

    // tslint:disable-next-line:variable-name
    _workspace: Workspace;
    machineType: Parameter;

    @Input() state: WorkspaceState;

    canUpdate = false;

    @Input() set workspace(value: Workspace) {
        if (!value.parameters) {
            this.formattedParameters = [];
            this.machineType = null;
            return;
        }

        this._workspace = value;
    }

    formattedParameters: Parameter[] = [];

    @Output() updateWorkspace = new EventEmitter<Array<Parameter>>();

    constructor(
        private authService: AuthServiceService,
        private permissionService: PermissionService,
        private namespaceTracker: NamespaceTracker) {
    }


    private populateParameters() {
        const parameters = [];
        const parametersMap = new Map<string, Parameter>();

        for (const param of this._workspace.templateParameters) {
            parametersMap[param.name] = param;
        }

        for (const param of this._workspace.parameters) {
            // Skip name as we already display it elsewhere
            if (param.name === 'sys-name') {
                continue;
            }

            const p = parametersMap[param.name];
            p.value = param.value;
            if (!this.canUpdate || param.name !== 'sys-node-pool') {
                parameters.push(p);
            } else {
                this.machineType = p;
            }
        }

        this.formattedParameters = parameters;
    }

    ngOnInit() {
        this.permissionService
            .getWorkspacePermissions(this.namespaceTracker.activeNamespace, this._workspace.uid, 'update')
            .subscribe(res => {
                this.canUpdate = !!res.update;
            }, err => {
                this.canUpdate = false;
            }).add(() => {
            this.populateParameters();
        });
    }

    update() {
        const submittedParameters: Parameter[] = [];

        // We need all of the parameters, but we only changed sys-node-pool, so update that value.
        for (const parameter of this._workspace.templateParameters) {
            if (parameter.name === 'sys-node-pool') {
                submittedParameters.push(this.machineType);
            } else {
                submittedParameters.push(parameter);
            }
        }

        this.updateWorkspace.emit(submittedParameters);
    }

    reloadParameters(workspace: Workspace) {
        this.workspace = workspace;
        this.populateParameters();

        const machineFormControl = this.formComponent.form.get(this.machineType.name);
        if (machineFormControl) {
            machineFormControl.setValue(this.machineType.value);
        }
    }
}
