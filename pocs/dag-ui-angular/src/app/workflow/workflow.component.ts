import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { SimpleWorkflowDetail, WorkflowService } from './workflow.service';
import { NodeRenderer, NodeStatus } from '../node/node.service';
import { DagClickEvent, DagComponent } from '../dag/dag.component';
import { WorkflowTemplateDetail } from '../workflow-template/workflow-template.service';
import { NodeInfoComponent } from "../node-info/node-info.component";

@Component({
  selector: 'app-workflow',
  templateUrl: './workflow.component.html',
  styleUrls: ['./workflow.component.scss'],
  providers: [WorkflowService],
  host: {
    '(window:resize)': 'onPageBodyResize($event)',
  },
})
export class WorkflowComponent implements OnInit, OnDestroy {
  @ViewChild(DagComponent, {static: false}) dag: DagComponent;
  @ViewChild('pageContent', {static: false}) set pageContent(value: ElementRef) {
    setTimeout( () => {
      // We (hackily) add 20px to account for padding/margin of elements, so we don't get a scroll.
      this.height = `calc(100vh - ${value.nativeElement.offsetTop + 20}px)`;
    }, 0);
  }

  private _nodeInfoElement: NodeInfoComponent;
  @ViewChild(NodeInfoComponent, {static: false}) set nodeInfoElement(value: NodeInfoComponent) {
    if(!value) {
      return;
    }

    setTimeout( () => {
      this._nodeInfoElement = value;

      this.nodeInfoHeight = (document.getElementById('info-box').offsetHeight - 2) + 'px';
    });
  }

  namespace: string;
  name: string;
  workflow: SimpleWorkflowDetail;
  workflowTemplate: WorkflowTemplateDetail;

  socket: WebSocket;

  nodeInfo?: NodeStatus = null;
  height = '1000px'; // Dummy large value.
  nodeInfoHeight = '1000px'; // Dummy large value.
  showNodeInfo = false;
  selectedNodeId = null;
  showLogs = false;

  get dagIdentifier() {
    return {
      type: 'workflow',
      namespace: this.namespace,
      name: this.name,
    };
  }

  constructor(
    private activatedRoute: ActivatedRoute,
    private workflowService: WorkflowService,
  ) {
  }

  ngOnInit() {
    this.activatedRoute.paramMap.subscribe(next => {
      this.setNamespaceName(next.get('namespace'), next.get('name'));

      this.workflowService.getWorkflow(this.namespace, this.name)
        .subscribe(res => {
          this.workflow = res;

          this.socket = this.workflowService.watchWorkflow(this.namespace, this.name);
          this.socket.onmessage = (event) => {this.onSocketMessage(event)};
          this.socket.onclose = (event) => {
            console.log('closed socket');
          };

          this.workflowTemplate = res.workflowTemplate;
        }, err => {

        });
    });
  }

  ngOnDestroy() {
    if (this.socket) {
      this.socket.close();
    }
  }

  setNamespaceName(namespace: string, name: string) {
    this.namespace = namespace;
    this.name = name;
  }

  onSocketMessage(event: any) {
    if (!this.dag) {
      return;
    }

    const data = JSON.parse(event.data);
    if (!data.result) {
      return;
    }

    this.workflow.updateWorkflowStatus(data.result.status);
    const status = this.workflow.getWorkflowStatus();

    // It is possible there is no node data yet. In which case, we can't display a dag.
    if(!status.nodes) {
      return;
    }

    if(this.selectedNodeId) {
      this.nodeInfo = status.nodes[this.selectedNodeId];

      if(this._nodeInfoElement) {
        this._nodeInfoElement.updateNodeStatus(this.nodeInfo);
      }
    }

    if(status) {
      const graph = NodeRenderer.createGraphFromWorkflowStatus(status);
      this.dag.display(graph);
    }
  }

  handleNodeClicked(event: DagClickEvent) {
    const status = this.workflow.getWorkflowStatus();
    if(!status) {
      return;
    }

    this.showNodeInfo = true;
    this.nodeInfo = status.nodes[event.nodeId];

    if(this._nodeInfoElement) {
      this._nodeInfoElement.updateNodeStatus(this.nodeInfo);
    }
    this.selectedNodeId = event.nodeId;
  }

  onNodeInfoClosed() {
    this.nodeInfo = null;
    this.showNodeInfo = false;
  }

  onPageBodyResize(event) {
    setTimeout( () => {
      this.nodeInfoHeight = (document.getElementById('info-box').offsetHeight - 2) + 'px';
    });
  }

  onLogsClicked() {
    console.log('logs clicked');
    this.showLogs = true;
  }
}
