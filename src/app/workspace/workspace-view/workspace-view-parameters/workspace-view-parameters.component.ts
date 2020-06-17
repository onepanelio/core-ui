import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { AuthServiceService, Parameter, Workspace } from "../../../../api";
import { WorkspaceState } from "../workspace-view.component";
import { NamespaceTracker } from "../../../namespace/namespace-tracker.service";

@Component({
  selector: 'app-workspace-view-parameters',
  templateUrl: './workspace-view-parameters.component.html',
  styleUrls: ['./workspace-view-parameters.component.scss']
})
export class WorkspaceViewParametersComponent implements OnInit {

  _workspace: Workspace;
  machineType: Parameter;

  @Input() state: WorkspaceState;

  canUpdate = false;

  @Input() set workspace(value: Workspace) {
    if(!value.parameters) {
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
    private namespaceTracker: NamespaceTracker) { }
  

  private populateParameters() {
    let parameters = [];
      let parametersMap = new Map<string, Parameter>();

      for(let param of this._workspace.templateParameters) {
        parametersMap[param.name] = param;
      }

      for(let param of this._workspace.parameters) {
        // Skip name as we already display it elsewhere
        if(param.name === 'sys-name') {
          continue;
        }

        let p = parametersMap[param.name];
        p.value = param.value;
        if(!this.canUpdate || param.name !== 'sys-node-pool') {
          parameters.push(p);
        } else {
          this.machineType = p;
        }
      }

      this.formattedParameters = parameters;
  }

  ngOnInit() {
    this.authService.isAuthorized({
      namespace: this.namespaceTracker.activeNamespace,
      verb: 'update',
      resource: 'workspaces',
      resourceName: this._workspace.uid,
      group: 'onepanel.io',
    }).subscribe(res => {
      this.canUpdate = !!res.authorized;
    }, err => {
      this.canUpdate = false;
    }).add(() => {
      this.populateParameters();
    });
  }

  update() {
    let submittedParameters: Parameter[] = [];

    // We need all of the parameters, but we only changed sys-node-pool, so update that value.
    for(let parameter of this._workspace.templateParameters) {
      if(parameter.name === 'sys-node-pool') {
        submittedParameters.push(this.machineType);
      } else {
        submittedParameters.push(parameter);
      }
    }

    this.updateWorkspace.emit(submittedParameters);
  }
}
