import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { LogsService } from "./logs.service";
import { NodeStatus } from "../node/node.service";

@Component({
  selector: 'app-logs',
  templateUrl: './logs.component.html',
  styleUrls: ['./logs.component.scss'],
  providers: [LogsService]
})
export class LogsComponent implements OnInit, OnDestroy {
  @Input() namespace: string;
  @Input() workflowName: string;
  @Input() podId: string;

  private _nodeInfo;
  @Input() set nodeInfo(value: NodeStatus) {
    this._nodeInfo = value;

    if (value.phase === 'Running' || value.phase === 'Succeeded') {
      this.getLogs();
    } else {
      this.logText = 'Node is not running yet.';
    }
  }
  get nodeInfo(): NodeStatus {
    return this._nodeInfo;
  }

  private socket;
  private gettingLogsForNodeId: string;

  logText = '';

  constructor(private logsService: LogsService) { }

  ngOnInit(): void {
  }

  getLogs() {
    if(this.gettingLogsForNodeId && this.gettingLogsForNodeId === this.nodeInfo.id) {
      return;
    }

    this.gettingLogsForNodeId = this.nodeInfo.id;
    if (this.socket) {
      this.socket.close();
    }
    this.logText = '';

    this.socket = this.logsService.getPodLogsSocket(this.namespace, this.workflowName, this.podId);

    this.socket.onmessage = (event: any) => {
      try {
        const jsonData = JSON.parse(event.data);

        if(jsonData.result && jsonData.result.content) {
          this.logText += jsonData.result.content + '\n';
        }

      } catch (e) {
        console.error(e);
      }
    };

    this.socket.onclose = (event) => {
      if (this.logText === '') {
        this.logText = 'No logs generated';
      }
    };
  }

  ngOnDestroy(): void {
    console.log('destroyed');

    if (this.socket) {
      this.socket.close();
    }
  }
}
