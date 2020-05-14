import { Component, Input, OnInit } from '@angular/core';
import { Parameter, Workspace } from "../../../../api";

@Component({
  selector: 'app-workspace-view-parameters',
  templateUrl: './workspace-view-parameters.component.html',
  styleUrls: ['./workspace-view-parameters.component.scss']
})
export class WorkspaceViewParametersComponent implements OnInit {

  machineType: Parameter;

  @Input() set workspace(value: Workspace) {
    let parameters = value.parameters;

    for(let param of value.templateParameters) {
      for(let originalParam of parameters) {
        if(originalParam.name !== param.name) {
          continue;
        }

        originalParam.options = param.options;
      }
    }

    let finalParameters = [];

    // filter out machine type
    for(const param of parameters) {
      if(param.name === 'sys-name') {
        // Skip name as we already display it elsewhere
        continue;
      } else if(param.name === 'sys-node-pool') {
        this.machineType = param;
      } else {
        finalParameters.push(param);
      }
    }

    this.formattedParameters = finalParameters;
  }

  formattedParameters: Parameter[] = [];

  constructor() { }

  ngOnInit() {
  }

}
