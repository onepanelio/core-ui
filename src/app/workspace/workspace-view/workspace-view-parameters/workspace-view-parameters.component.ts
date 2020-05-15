import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Parameter, Workspace } from "../../../../api";
import { WorkspaceState } from "../workspace-view.component";

@Component({
  selector: 'app-workspace-view-parameters',
  templateUrl: './workspace-view-parameters.component.html',
  styleUrls: ['./workspace-view-parameters.component.scss']
})
export class WorkspaceViewParametersComponent implements OnInit {

  _workspace: Workspace;
  machineType: Parameter;

  @Input() state: WorkspaceState;

  @Input() set workspace(value: Workspace) {
    if(!value.parameters) {
      this.formattedParameters = [];
      this.machineType = null;
      return;
    }

    this._workspace = value;
    let parameters = [];

    let selectedMachineType = '';

    for(let param of value.parameters) {
      // Skip name as we already display it elsewhere
      if(param.name === 'sys-name') {
        continue;
      }

      if(param.name !== 'sys-node-pool') {
        parameters.push(param);
      } else {
        selectedMachineType = param.value;
      }
    }

    // Get sys-node-pool from template, as only the template parameters have the stored options too.
    // We need the options to display them in the select box.
    for(let param of value.templateParameters) {
      if(param.name === 'sys-node-pool') {
        param.value = selectedMachineType;
        this.machineType = param;
      }
    }

    this.formattedParameters = parameters;
  }

  formattedParameters: Parameter[] = [];

  @Output() updateWorkspace = new EventEmitter<Array<Parameter>>();

  constructor() { }

  ngOnInit() {
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
