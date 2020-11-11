import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { NodeParameter, NodeStatus } from '../node/node.service';
import { SimpleWorkflowDetail, WorkflowPhase, WorkflowService, } from '../workflow/workflow.service';
import * as yaml from 'js-yaml';
import { TemplateDefinition } from '../workflow-template/workflow-template.service';
import { FileNavigator } from '../files/fileNavigator';
import { WorkflowServiceService } from '../../api';
import { Metric, MetricsService } from './metrics/metrics.service';

interface SideCar {
  name: string;
  url: string;
}

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

  startedAt = null;
  finishedAt = null;
  status: WorkflowPhase;
  message: string;
  logsAvailable = false;
  statusClass = {};
  inputParameters = [];
  outputParameters = [];
  inputArtifacts = [];
  outputArtifacts = [];

  parametersExpanded = false;
  containersExpanded = false;
  artifactsExpanded = false;
  template: TemplateDefinition;

  hasFiles = false;
  metrics: Metric[] = [];

  fileNavigators = [];
  fileLoaderSubscriptions = {};
  sidecars = new Array<SideCar>();

  constructor(private workflowService: WorkflowService,
              private workflowServiceService: WorkflowServiceService,
              private metricsService: MetricsService) { }

  static outputArtifactsToDirectories(outputArtifacts: any[]): Array<string> {
    const directoriesSet = new Map<string, boolean>();

    for (const outputArtifact of outputArtifacts) {
      let key: string|undefined;
      if (outputArtifact.s3 && outputArtifact.s3.key) {
        key = outputArtifact.s3.key;
      }

      if (key === undefined) {
        continue;
      }

      const lastSlash = key.lastIndexOf('/');
      let directory = key.substring(0, lastSlash);
      if (key.indexOf('.') === -1) {
        directory = key;
      }

      while (directory.lastIndexOf('/') === directory.length - 1) {
        directory = directory.substring(0, directory.length - 1);
      }

      directory = directory.replace('//', '/');

      directoriesSet.set(directory, true);
    }

    const keysToDelete = [];

    // Check to make sure we aren't dealing with any subdirectories
    // we don't want to have both a/b/c and a/b. Just a/b since we can navigate to c.
    for (const directory of directoriesSet.keys()) {
      const directoryParts = directory.split('/');
      let sumOfDirectory = '';
      for (let i = 0; i < directoryParts.length - 1; i++) {
        const part = directoryParts[i];
        sumOfDirectory = sumOfDirectory + part;

        if (directoriesSet.has(sumOfDirectory)) {
          // the directory has a common path with another one, delete it.
          keysToDelete.push(directory);
          break;
        }

        sumOfDirectory += '/';
      }
    }

    for (const keyToDelete of keysToDelete) {
      directoriesSet.delete(keyToDelete);
    }

    const directories = [];
    for (const key of directoriesSet.keys()) {
      directories.push(key);
    }

    return directories;
  }

  private static sysSideCarUrlPrefixLength = 17;

  private static paramToSideCar(parameter: NodeParameter): SideCar {
    let name = parameter.name.substring(NodeInfoComponent.sysSideCarUrlPrefixLength);
    // some of the names have dashes like 'tensor-first'.
    // change it to be 'tensor first' instead to look nicer for the button
    name = name.replace('-', ' ');
    let url = `//${parameter.value}`;

    return {
      name,
      url
    };
  }

  ngOnInit() {
  }

  ngOnDestroy() {
  }

  updateNodeStatus(node: NodeStatus) {
    if (!node) {
      return;
    }

    let loaded = null;

    this.inputParameters = [];
    this.inputArtifacts = [];
    this.outputParameters = [];
    this.outputArtifacts = [];

    this.previousNodeStatus = this.node;
    this.node = node;

    const skipped = node.phase === 'Skipped';

    if (!skipped) {
      if (node.startedAt) {
        this.startedAt = new Date(node.startedAt);
      } else {
        this.startedAt = node.startedAt;
      }

      if (node.finishedAt) {
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
      'font-success': this.status === 'Succeeded',
      'font-error': this.status === 'Terminated'
    };

    this.logsAvailable = node.type === 'Pod';

    try {
      const manifest = this.workflow.manifest;
      loaded = yaml.safeLoad(manifest);
      for (const template of loaded.spec.templates) {
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
    } else if (node.type === 'Pod' && node.inputs) {
      this.inputParameters = node.inputs.parameters;
      this.inputArtifacts = node.inputs.artifacts;
    }

    if (node.type !== 'DAG' && node.type !== 'Steps' && node.outputs) {
      if(node.outputs.parameters) {
        this.updateOutputParameters(node.outputs.parameters);
      }

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
    if (this.updatedToSameNode() && !this.transitionedToFinishedNode()) {
      return;
    }

    this.hasFiles = false;

    for (const fileNavigator of this.fileNavigators) {
      fileNavigator.cleanUp();
    }

    this.fileNavigators = [];
    const directories = NodeInfoComponent.outputArtifactsToDirectories(this.outputArtifacts);

    for (const directory of directories) {
      const fileNavigator = new FileNavigator({
        rootPath: directory,
        namespace: this.namespace,
        name: this.name,
        workflowService: this.workflowServiceService,
      });

      // Check if there are any files at all. If there isn't, don't display the file browser.
      this.fileLoaderSubscriptions[directory] = fileNavigator.filesChanged.subscribe(() => {
        this.hasFiles = this.hasFiles || fileNavigator.hasFiles;

        this.fileLoaderSubscriptions[directory].unsubscribe();
      });

      fileNavigator.loadFiles();

      this.fileNavigators.push(fileNavigator);
    }
  }

  updateMetrics() {
    if (this.updatedToSameNode() && !this.transitionedToFinishedNode()) {
      return;
    }

    // Clear out the metrics. On success, it'll load new data.
    // On failure, we will not have any metrics.
    this.metrics = [];

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

  updateOutputParameters(parameters: NodeParameter[]) {
    let sidecars = [];
    let outputParameters = [];

    for(const param of parameters) {
      if(param.name.startsWith('sys-sidecar-url')) {
        sidecars.push(NodeInfoComponent.paramToSideCar(param));
      } else {
        outputParameters.push(param);
      }
    }

    this.sidecars = sidecars;
    this.outputParameters = outputParameters;
  }

  openSidecar(url: string) {
    window.open(url);
  }
}
