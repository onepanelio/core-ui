import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { NodeStatus } from '../node/node.service';
import { SimpleWorkflowDetail, WorkflowPhase, WorkflowService, } from "../workflow/workflow.service";
import * as yaml from 'js-yaml';
import { TemplateDefinition } from "../workflow-template/workflow-template.service";
import { FileNavigator, LongRunningTaskState, SlowValueUpdate } from "../files/fileNavigator";
import { ModelFile, WorkflowServiceService } from "../../api";
import { Metric, MetricsService } from "./metrics/metrics.service";

@Component({
  selector: 'app-node-info',
  templateUrl: './node-info.component.html',
  styleUrls: ['./node-info.component.scss'],
  providers: [WorkflowService, MetricsService]
})
export class NodeInfoComponent implements OnInit, OnDestroy {
  @Input() namespace: string;
  @Input() name: string;

  @Input() visible = true;
  @Input() workflow: SimpleWorkflowDetail;
  @Output() yamlClicked = new EventEmitter();
  @Output() closeClicked = new EventEmitter();
  @Output() logsClicked = new EventEmitter();

  node: NodeStatus;
  previousNodeStatus: NodeStatus;
  protected fileLoaderSubscriber;

  startedAt = null;
  finishedAt = null;
  status: WorkflowPhase;
  message: string;
  logsAvailable: boolean = false;
  statusClass = {};
  inputParameters = [];
  outputParameters = [];
  inputArtifacts = [];
  outputArtifacts = [];

  parametersExpanded = false;
  containersExpanded = false;
  artifactsExpanded = false;
  template: TemplateDefinition;

  fileNavigator: FileNavigator;
  hasFiles = false;
  metrics: Metric[] = [];

  constructor(private workflowService: WorkflowService,
              private workflowServiceService: WorkflowServiceService,
              private metricsService: MetricsService) { }

  ngOnInit() {
  }

  ngOnDestroy() {
  }

  updateNodeStatus(node: NodeStatus) {
    let loaded = null;

    this.inputParameters = [];
    this.inputArtifacts = [];

    this.previousNodeStatus = this.node;
    this.node = node;

    const skipped = node.phase === 'Skipped';

    if(!skipped) {
      if (node.startedAt) {
        this.startedAt = new Date(node.startedAt);
      } else {
        this.startedAt = node.startedAt;
      }

      if(node.finishedAt) {
        this.finishedAt = new Date(node.finishedAt);
      } else {
        // Error phase has no finished date
        if (node.phase === 'Error') {
          this.finishedAt = node.startedAt;
        } else {
          this.finishedAt = node.finishedAt;
        }
      }
    } else {
      this.startedAt = undefined;
      this.finishedAt = undefined;
    }

    this.status = node.phase;
    this.message = node.message;

    this.statusClass = {
      'font-primary': ['Pending', 'Running'].indexOf(this.status) > -1,
      'font-success': this.status === 'Succeeded'
    };

    this.logsAvailable = node.type === 'Pod';

    try {
      const manifest = this.workflow.manifest;
      loaded = yaml.safeLoad(manifest);
      for (let template of loaded.spec.templates) {
        if (template.name === node.templateName) {
          this.template = template;
        }
      }
    } catch (e) {
      this.template = null;
    }

    if ((node.type === 'DAG' || node.type === 'Steps')
      && node.templateName === loaded.spec.entrypoint
      && loaded && loaded.spec.arguments.parameters) {
      this.inputParameters = loaded.spec.arguments.parameters;
    } else if (node.type == 'Pod' && node.inputs) {
      this.inputParameters = node.inputs.parameters;
      this.outputArtifacts = node.inputs.artifacts;
    }


    if (node.type !== 'DAG' && node.type !== 'Steps' && node.outputs) {
      this.outputParameters = node.outputs.parameters;
      this.outputArtifacts = node.outputs.artifacts;
    }

    this.updateFiles();
    this.updateMetrics();
  }

  onCloseClick() {
    this.closeClicked.emit();
  }

  openYaml() {
    this.yamlClicked.emit();
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

  updateFiles() {
    if(this.updatedToSameNode() && !this.transitionedToFinishedNode()) {
      return;
    }

    if(this.fileNavigator) {
      this.fileNavigator.cleanUp();
    }

    this.fileNavigator = new FileNavigator({
      rootPath: `artifacts/${this.namespace}/${this.name}/${this.node.id}`,
      namespace: this.namespace,
      name: this.name,
      workflowService: this.workflowServiceService,
    });

    // Check if there are any files at all. If there isn't, don't display the file browser.
    this.fileLoaderSubscriber = this.fileNavigator.filesChanged.subscribe(() => {
      this.hasFiles = this.fileNavigator.hasFiles;
      this.fileLoaderSubscriber.unsubscribe();
    });

    this.fileNavigator.loadFiles();
  }

  updateMetrics() {
    if(this.updatedToSameNode() && !this.transitionedToFinishedNode()) {
      return;
    }

    this.metricsService.getWorkflowMetrics(this.namespace, this.workflow.name, this.node.id)
        .subscribe(res => {
          this.metrics = res.metrics;
        });
  }

  /**
   * Compares the previous node status to the current one (if available)
   * and returns true if we are on the same node status.
   */
  private updatedToSameNode(): boolean {
    return this.previousNodeStatus && this.previousNodeStatus.id === this.node.id;
  }

  /**
   * Compares the previous node status and the current one (if available)
   * to see if the status went from unfinished to finished and returns this.
   */
  private transitionedToFinishedNode(): boolean {
    return this.previousNodeStatus && this.previousNodeStatus.finishedAt === null && this.node.finishedAt !== null;
  }
}
