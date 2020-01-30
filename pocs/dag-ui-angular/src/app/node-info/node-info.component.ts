import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { NodeInfo, NodeStatus } from '../node/node.service';
import { SimpleWorkflowDetail, Workflow, WorkflowStatus } from "../workflow/workflow.service";
import { setInterval } from "timers";

@Component({
  selector: 'app-node-info',
  templateUrl: './node-info.component.html',
  styleUrls: ['./node-info.component.scss']
})
export class NodeInfoComponent implements OnInit, OnDestroy {
  @Input() workflow: SimpleWorkflowDetail;
  @Output() closeClicked = new EventEmitter();
  private node: NodeStatus;

  startedAt = null;
  finishedAt = null;
  duration: string|null = null;
  status: string;

  timer = null;

  constructor() { }

  ngOnInit() {
  }

  ngOnDestroy() {
    this.cleanUpTimer();
  }

  cleanUpTimer() {
    if(this.timer) {

    }
  }

  updateNodeStatus(node: NodeStatus) {
    this.node = node;
    this.cleanUpTimer();

    if(node.startedAt) {
      this.startedAt = new Date(node.startedAt);
    }

    if(node.finishedAt) {
      this.finishedAt = new Date(node.finishedAt);
    }

    if(!node.finishedAt) {
      this.timer = setInterval(this.formatDurationToNow, 1000);
    }

    this.status = node.phase;

    if(this.startedAt && this.finishedAt) {
      this.duration = this.formatDuration(this.startedAt, this.finishedAt);
    } else if(this.startedAt && !this.finishedAt) {
      this.formatDurationToNow();
    }
  }

  formatDurationToNow() {
    if(!this.startedAt) {
      return;
    }

    this.duration = this.formatDuration(this.startedAt, new Date());
  }

  formatDuration(started: Date, finished: Date): string|null {
    const seconds = Math.floor((finished.getTime() - started.getTime()) / 1000.0);
    if(seconds < 0) {
      return null;
    }

    let minutes = Math.floor(seconds / 60).toFixed(0);

    if (minutes === '0') {
      minutes = '00';
    }

    let remainingSeconds: any = seconds % 60;
    if (remainingSeconds < 10) {
      remainingSeconds = '0' + remainingSeconds;
    }

    return `${minutes}:${remainingSeconds}`;
  }

  onCloseClick() {
    this.closeClicked.emit();
  }
}
