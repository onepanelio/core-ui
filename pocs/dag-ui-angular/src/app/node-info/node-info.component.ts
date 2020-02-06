import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { NodeInfo, NodeStatus } from '../node/node.service';
import { SimpleWorkflowDetail, } from "../workflow/workflow.service";

@Component({
  selector: 'app-node-info',
  templateUrl: './node-info.component.html',
  styleUrls: ['./node-info.component.scss']
})
export class NodeInfoComponent implements OnInit, OnDestroy {
  @Input() workflow: SimpleWorkflowDetail;
  @Output() closeClicked = new EventEmitter();
  @Output() logsClicked = new EventEmitter();

  private node: NodeStatus;

  startedAt = null;
  finishedAt = null;
  status: string;
  logsAvailable: boolean = false;
  statusClass = {};
  inputs = [];
  outputs = [];

  parametersExpanded = false;
  containersExpanded = false;
  artifactsExpanded = false;

  constructor() { }

  ngOnInit() {
  }

  ngOnDestroy() {
  }

  updateNodeStatus(node: NodeStatus) {
    this.node = node;

    if(node.startedAt) {
      this.startedAt = new Date(node.startedAt);
    }

    if(node.finishedAt) {
      this.finishedAt = new Date(node.finishedAt);
    }

    this.status = node.phase;

    this.statusClass = {
      'font-primary': ['Pending', 'Running'].indexOf(this.status) > -1,
      'font-success': this.status === 'Succeeded'
    };

    this.logsAvailable = node.type === 'Pod';

    if (node.inputs && node.inputs.parameters) {
      this.inputs = node.inputs.parameters;
    } else {
      this.inputs = [];
    }

    if (node.outputs && node.outputs.parameters) {
      this.outputs = node.outputs.parameters;
    } else {
      this.outputs = [];
    }
  }

  onCloseClick() {
    this.closeClicked.emit();
  }

  openLogs() {
    this.logsClicked.emit();
  }

  onParametersExpandChange(expanded: boolean) {
    this.parametersExpanded = expanded;
  }

  onContainersExpandChange(expanded: boolean) {
    this.containersExpanded = expanded;
  }

  onArtifactsExpandChange(expanded: boolean) {
    this.artifactsExpanded = expanded;
  }
}
