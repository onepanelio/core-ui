import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { Parameter, Workspace } from '../../../../api';
import { FormComponent } from '../../../fields/form/form.component';

export interface WorkspaceResumeEvent {
  workspace: Workspace;
  machineType: Parameter;
}

@Component({
  selector: 'app-workspace-paused',
  templateUrl: './workspace-paused.component.html',
  styleUrls: ['./workspace-paused.component.scss']
})
export class WorkspacePausedComponent implements OnInit {
  @ViewChild(FormComponent, { static: false }) formComponent: FormComponent;

  @Input() workspace: Workspace;
  @Input() disabled = false;
  @Output() onResume = new EventEmitter<WorkspaceResumeEvent>();

  machineType: Parameter;
  resuming = false;

  constructor() { }

  ngOnInit() {
    this.populateParameters();
  }

  onResumeClick() {
    this.machineType.value = this.formComponent.form.get(this.machineType.name).value;
    this.resuming = true;
    this.onResume.emit({
      workspace: this.workspace,
      machineType: this.machineType
    });
  }

  private populateParameters() {
    const parametersMap = new Map<string, Parameter>();

    for (const param of this.workspace.templateParameters) {
      parametersMap[param.name] = param;
    }

    for (const param of this.workspace.parameters) {
      if (param.name !== 'sys-node-pool') {
        continue;
      }

      const p = parametersMap[param.name];
      p.value = param.value;
      this.machineType = p;
    }
  }
}
