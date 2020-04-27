import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { SimpleWorkflowDetail, Workflow, WorkflowService } from './workflow.service';
import { NodeRenderer, NodeStatus } from '../node/node.service';
import { DagClickEvent, DagComponent } from '../dag/dag.component';
import { NodeInfoComponent } from "../node-info/node-info.component";
import { MatSnackBar, MatSnackBarRef, SimpleSnackBar } from "@angular/material/snack-bar";
import { AceEditorComponent } from "ng2-ace-editor";
import * as yaml from 'js-yaml';
import * as ace from 'brace';
import { KeyValue, WorkflowExecution, WorkflowServiceService } from "../../api";
import { MatDialog } from "@angular/material/dialog";
import { LabelEditDialogComponent } from "../labels/label-edit-dialog/label-edit-dialog.component";
const aceRange = ace.acequire('ace/range').Range;

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
  private snackbarRef: MatSnackBarRef<SimpleSnackBar>;

  @ViewChild('yamlEditor', {static: true}) yamlEditor: AceEditorComponent;
  @ViewChild(DagComponent, {static: false}) dag: DagComponent;
  @ViewChild('pageContent', {static: false}) set pageContent(value: ElementRef) {
    setTimeout( () => {
      // We (hackily) add 20px to account for padding/margin of elements, so we don't get a scroll.
      // We subtract 300 so we get a minimum height of 300px
      this.height = `calc(100vh - ${value.nativeElement.offsetTop + 20 - 300}px)`;
    }, 0);
  }

  private _nodeInfoElement: NodeInfoComponent;
  @ViewChild(NodeInfoComponent, {static: false}) set nodeInfoElement(value: NodeInfoComponent) {
    if(!value) {
      return;
    }

    setTimeout( () => {
      this._nodeInfoElement = value;
      this.updateNodeInfoProperties();
    });
  }

  namespace: string;
  name: string;
  workflow: SimpleWorkflowDetail;

  socket: WebSocket;

  nodeInfo?: NodeStatus;
  height = '1000px'; // Dummy large value.
  nodeInfoHeight = '1000px'; // Dummy large value.
  nodeInfoTop = '0'; //Dummy initial value

  showNodeInfo = false;
  selectedNodeId = null;
  showLogs = false;
  showYaml = false;

  labels = new Array<KeyValue>();
  parameters = new Array<{name: string, value: string}>();

  showAllParameters = false;

  private socketClosedCount = 0;
  private socketErrorCount = 0;

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
    private workflowServiceService: WorkflowServiceService,
    private apiWorkflowService: WorkflowServiceService,
    private dialog: MatDialog,
    private router: Router,
    private snackbar: MatSnackBar,
  ) {
  }

  ngOnInit() {
    this.activatedRoute.paramMap.subscribe(next => {
      this.setNamespaceName(next.get('namespace'), next.get('name'));

      this.startCheckingWorkflow();
    });
  }

  startCheckingWorkflow() {
    this.workflowService.getWorkflow(this.namespace, this.name)
        .subscribe(res => {
          this.workflow = res;

          let parsedManifest = JSON.parse(res.manifest);

          if(parsedManifest.spec && parsedManifest.spec.arguments && parsedManifest.spec.arguments.parameters) {
            this.parameters = parsedManifest.spec.arguments.parameters;
          }

          this.getLabels();

          if(this.socket) {
            this.socket.close();
            this.socket = null;
          }

          this.socket = this.workflowService.watchWorkflow(this.namespace, this.name);
          this.socket.onmessage = (event) => {
            this.onWorkflowExecutionUpdate(event.data);
          };

          this.socket.onerror = (err) => {
            this.socketErrorCount += 1;

            if (this.socketErrorCount < 2) {
              this.startCheckingWorkflow();
            }
          };

          this.socket.onclose = (msg) => {
            this.socketClosedCount += 1;

            if (this.socketClosedCount < 2) {
              this.startCheckingWorkflow();
            }
          };
        });
  }

  ngOnDestroy() {
    if (this.socket) {
      this.socket.close();
    }

    if (this.snackbarRef) {
      this.snackbarRef.dismiss();
    }
  }

  setNamespaceName(namespace: string, name: string) {
    this.namespace = namespace;
    this.name = name;
  }

  onWorkflowExecutionUpdate(rawData: any) {
    if (!this.dag) {
      return;
    }

    let data;
    try {
      data = JSON.parse(rawData);
    } catch (e) {
      return;
    }

    if(!data.result) {
      return;
    }

    this.workflow.updateWorkflowManifest(data.result.manifest);
    const status = this.workflow.workflowStatus;

    // It is possible there is no node data yet. In which case, we can't display a dag.
    if(!status || !status.nodes) {
      return;
    }

    if(this.selectedNodeId && this.selectedNodeId !== this.workflow.name) {
      // TODO node here.
      this.nodeInfo = status.nodes[this.selectedNodeId];

      if(this._nodeInfoElement) {
        this._nodeInfoElement.updateNodeStatus(this.nodeInfo);
      }
    }

    const graph = NodeRenderer.createGraphFromWorkflowStatus(status);
    this.dag.display(graph);
  }

  handleNodeClicked(event: DagClickEvent) {
    if(event.nodeId === this.workflow.name) {
      this.showNodeInfo = false;
      return;
    }

    const newNodeInfo = this.workflow.getNodeStatus(event.nodeId);
    if(!newNodeInfo) {
      return;
    }

    this.nodeInfo = newNodeInfo;
    this.updateNodeInfoProperties();

    this.showNodeInfo = true;


    if(this._nodeInfoElement) {
      this._nodeInfoElement.updateNodeStatus(this.nodeInfo);
    }
    this.selectedNodeId = event.nodeId;

    this.showLogs = false;

    if(this.showYaml) {
      this.updateYamlSelection();
    }
  }

  onNodeInfoClosed() {
    this.nodeInfo = null;
    this.showNodeInfo = false;
  }

  onPageBodyResize(event) {
    setTimeout( () => {
      this.updateNodeInfoProperties();
    });
  }


  private markerId;

  onYamlClicked() {
    if(!this.workflow) {
      return;
    }

    if(!this.nodeInfo) {
      return;
    }

    this.showYaml = true;

    this.updateYamlSelection();
  }

  updateYamlSelection() {
    const spec = this.workflow.yamlManifest;
    const parsedYaml = yaml.safeLoad(spec);
    const templates = parsedYaml.templates;

    let templateNames = [];
    let selectedTemplate = null;
    for(let template of templates) {
      templateNames.push(template.name);
      if(template.name === this.nodeInfo.templateName) {
        selectedTemplate = template;
      }
    }

    const manifestLines = spec.split("\n");

    let templatesLineNumber = -1;
    let templatesIndentation = 0;
    for(let i = 0; i < manifestLines.length; i++) {
      const line = manifestLines[i];
      const templateIndex = line.indexOf('templates');
      if(templateIndex >= 0) {
        templatesLineNumber = i;
        templatesIndentation = templateIndex;
        break;
      }
    }

    let templateStartLineNumber = -1;
    let templateEndLineNumber = -1;
    let firstNameIndentation = -1;

    for(let i = templatesLineNumber; i < manifestLines.length; i++) {
      const line = manifestLines[i];

      const trimmedLine = line.trimLeft();
      if (trimmedLine.length === 0) {
        continue;
      }

      const indentation = line.length - trimmedLine.length;

      if(indentation < templatesIndentation) {
        break;
      }

      const nameIndex = line.indexOf('name');
      if (firstNameIndentation === -1 || (nameIndex < firstNameIndentation)) {
        firstNameIndentation = nameIndex;
      }

      if(templateStartLineNumber === -1 && nameIndex > 0 && nameIndex == firstNameIndentation) {
        if(line.indexOf(this.nodeInfo.templateName) >= 0) {
          templateStartLineNumber = i;
        }
        continue;
      }

      if (templateEndLineNumber === -1 && nameIndex > 0 && nameIndex <= firstNameIndentation ) {
        templateEndLineNumber = i - 1;
        break;
      }
    }

    if(templateStartLineNumber !== -1 && templateEndLineNumber === -1) {
      templateEndLineNumber = manifestLines.length;
    }

    const from = templateStartLineNumber;
    const to = templateEndLineNumber;


    if(this.markerId) {
      this.yamlEditor.getEditor().session.removeMarker(this.markerId);
    }

    this.markerId = this.yamlEditor.getEditor().session.addMarker(new aceRange(from, 0, to, 100), "highlight", "fullLine");
    this.yamlEditor.getEditor().scrollToLine(from, true, true, () => {});
  }

  onLogsClicked() {
    if(!this.nodeInfo) {
      return;
    }

    this.showLogs = true;
  }

  onLogsClosed() {
    this.showLogs = false;
  }

  updateNodeInfoProperties() {
    this.nodeInfoHeight = (document.getElementById('info-box').offsetHeight - 2) + 'px';
    this.nodeInfoTop = (document.getElementById('info-box').offsetTop) + 'px';
  }

  onTerminate() {
    this.workflowService.terminateWorkflow(this.namespace, this.workflow.name)
        .subscribe(res => {
          this.snackbarRef = this.snackbar.open('Workflow stopped', 'OK');
        }, err => {
          this.snackbarRef = this.snackbar.open('Unable to stop workflow', 'OK');
        })
  }

  onYamlClose() {
    this.showYaml = false;
  }

  onShowTotalYaml() {
    if(this.markerId) {
      this.yamlEditor.getEditor().session.removeMarker(this.markerId);
    }

    this.showYaml = true;
  }

  getLabels() {
    this.workflowServiceService.getWorkflowExecutionLabels(this.namespace, this.workflow.name)
        .subscribe(res => {
          if(!res.labels) {
            return;
          }

          this.labels = res.labels;
        })
  }

  onEdit() {
    let labelsCopy = [];
    if(this.labels) {
      labelsCopy = this.labels.slice();
    }

    const dialogRef = this.dialog.open(LabelEditDialogComponent, {
      width: '500px',
      maxHeight: '100vh',
      data: {
        labels: labelsCopy
      }
    });

    dialogRef.afterClosed().subscribe(data => {
      if(!data) {
        return;
      }

      this.workflowServiceService.replaceWorkflowExecutionLabels(this.namespace, this.workflow.name, {
        items: data
      }).subscribe(res => {
        this.labels = res.labels;
      })
    });
  }

  toggleShowParameters() {
    this.showAllParameters = !this.showAllParameters;
  }

  runAgain() {
    let data: WorkflowExecution = {
      workflowTemplate: this.workflow.workflowTemplate,
    };

    this.workflowServiceService.createWorkflowExecution(this.namespace, data)
        .subscribe(res => {
          this.router.navigate(['/', this.namespace, 'workflows', res.name]);
        })
  }
}
