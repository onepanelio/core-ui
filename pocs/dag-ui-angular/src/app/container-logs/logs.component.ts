import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
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
  @Output() closeClicked = new EventEmitter();

  private _nodeInfo;
  @Input() set nodeInfo(value: NodeStatus) {
    this._nodeInfo = value;

    if (value.phase === 'Running' || value.phase === 'Succeeded') {
      this.information = '';
      this.getLogs();
    } else {
      this.information = 'Node is not running yet.';
      this.loading = true;
    }
  }
  get nodeInfo(): NodeStatus {
    return this._nodeInfo;
  }

  private socket;
  private gettingLogsForNodeId: string;

  logText = '';
  loading = true;
  information = '';

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
      this.loading = false;
      if (this.logText === '') {
        this.information = 'No logs generated';
      }
    };
  }

  ngOnDestroy(): void {
    if (this.socket) {
      this.socket.close();
    }
  }

  onCloseClick() {
    this.closeClicked.emit();
  }
}
