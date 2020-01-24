import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import { Workflow, WorkflowService, WorkflowStatus } from './workflow.service';
import { NodeInfo, NodeRenderer, NodeStatus } from '../node/node.service';
import { DagClickEvent, DagComponent } from '../dag/dag.component';
import { WorkflowTemplateDetail } from '../workflow-template/workflow-template.service';

@Component({
  selector: 'app-workflow',
  templateUrl: './workflow.component.html',
  styleUrls: ['./workflow.component.scss'],
  providers: [WorkflowService]
})
export class WorkflowComponent implements OnInit, OnDestroy {
  @ViewChild(DagComponent, {static: false}) dag: DagComponent;
  @ViewChild('pageContent', {static: false}) set pageContent(value: ElementRef) {
    setTimeout( () => {
      // we add 10 px for bottom padding
      this.height = `calc(100vh - ${value.nativeElement.offsetTop + 10}px)`;
    }, 0);
  }

  namespace: string;
  name: string;
  workflow: Workflow;
  parsedWorkflowStatus: WorkflowStatus;

  workflowTemplate: WorkflowTemplateDetail;

  socket: WebSocket;

  nodeInfo?: NodeStatus = null;
  height = '1000px'; // Dummy large value.

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

          this.parsedWorkflowStatus = JSON.parse(this.workflow.status);

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

    this.socket = this.workflowService.watchWorkflow(namespace, name);
    this.socket.onmessage = (event) => {this.onSocketMessage(event)};
  }

  onSocketMessage(event: any) {
    if (!this.dag) {
      return;
    }

    const data = JSON.parse(event.data);
    if (!data.result) {
      return;
    }

    const status = JSON.parse(data.result.status);
    const graph = NodeRenderer.createGraphFromWorkflowStatus(status);
    this.parsedWorkflowStatus = status;

    this.dag.display(graph);
  }

  handleNodeClicked(event: DagClickEvent) {
    this.nodeInfo = this.parsedWorkflowStatus.nodes[event.nodeId];
  }
}
