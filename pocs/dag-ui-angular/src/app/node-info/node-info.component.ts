import { Component, Input, OnInit } from '@angular/core';
import { NodeInfo, NodeStatus } from '../node/node.service';

@Component({
  selector: 'app-node-info',
  templateUrl: './node-info.component.html',
  styleUrls: ['./node-info.component.scss']
})
export class NodeInfoComponent implements OnInit {

  @Input() node: NodeStatus;

  constructor() { }

  ngOnInit() {
  }

  formatDuration() {
    if (!this.node.startedAt || !this.node.finishedAt) {
      return null;
    }

    const finished = new Date(this.node.finishedAt);
    const started = new Date(this.node.startedAt);
    const seconds = finished.getUTCSeconds() - started.getUTCSeconds();
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
}
