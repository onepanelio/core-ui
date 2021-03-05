import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { NodeParameter, NodeStatus } from '../node/node.service';
import { SimpleWorkflowDetail, WorkflowPhase, WorkflowService, } from '../workflow/workflow.service';
import * as yaml from 'js-yaml';
import { TemplateDefinition, VolumeMount } from '../workflow-template/workflow-template.service';
import { FileNavigator } from '../files/fileNavigator';
import { Parameter, WorkflowServiceService } from '../../api';
import { Metric, MetricsService } from './metrics/metrics.service';
import { WorkflowFileApiWrapper } from '../files/WorkflowFileApiWrapper';
import { MatSnackBar } from '@angular/material/snack-bar';
import { FileSyncerFileApi } from '../files/file-api';
import { AuthService } from '../auth/auth.service';
import { HttpClient } from '@angular/common/http';
import { BreadcrumbPath, PathPart } from '../files/file-browser/file-browser.component';
import { ConfigService } from '../config/config.service';

interface SideCar {
  name: string;
  url: string;
  display: boolean;
}

@Component({
  selector: 'app-node-info',
  templateUrl: './node-info.component.html',
  styleUrls: ['./node-info.component.scss'],
  providers: [WorkflowService, MetricsService]
})
export class NodeInfoComponent implements OnInit, OnDestroy {

  constructor(private workflowService: WorkflowService,
              private workflowServiceService: WorkflowServiceService,
              private metricsService: MetricsService,
              private snackBar: MatSnackBar,
              private appAuthService: AuthService,
              private httpClient: HttpClient,
              private configService: ConfigService) { }

  private static sysSideCarUrlPrefixLength = 17;
  @Input() namespace: string;
  @Input() name: string;

  @Input() visible = true;
  @Input() workflow: SimpleWorkflowDetail;
  @Input() nodePoolLabel: string;
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
  rawParameters = new Array<NodeParameter>();
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

  localFileNavigators = new Array<FileNavigator>();
  nodePool: Parameter;
  nodePoolRequestedAt: Date;

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

  private static paramToSideCar(parameter: NodeParameter): SideCar {
    let name = parameter.name.substring(NodeInfoComponent.sysSideCarUrlPrefixLength);
    // some of the names have dashes like 'tensor-first'.
    // change it to be 'tensor first' instead to look nicer for the button
    name = name.replace(/-/g, ' ');
    const url = `//${parameter.value}`;
    const display = name !== 'sys filesyncer';

    return {
      name,
      url,
      display
    };
  }

  ngOnInit() {
  }

  ngOnDestroy() {
    FileNavigator.cleanUp(this.localFileNavigators);
    this.localFileNavigators = [];

    FileNavigator.cleanUp(this.fileNavigators);
    this.fileNavigators = [];
  }

  updateNodeStatus(node: NodeStatus) {
    if (!node) {
      return;
    }

    let loaded = null;

    this.inputParameters = [];
    this.inputArtifacts = [];
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
      if (node.outputs.parameters) {
        this.updateOutputParameters(node.outputs.parameters);
      }

      this.outputArtifacts = node.outputs.artifacts;
    }

    this.updateFiles();
    this.updateMetrics();
    this.refreshOutputParameters();

    this.nodePool = null;
    this.getNodePool();
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

    FileNavigator.cleanUp(this.fileNavigators);
    this.fileNavigators = [];

    const directories = NodeInfoComponent.outputArtifactsToDirectories(this.outputArtifacts);

    const service = new WorkflowFileApiWrapper(this.namespace, 'dialog', this.workflowServiceService);

    for (const directory of directories) {
      const fileNavigator = new FileNavigator({
        rootPath: directory,
        namespace: this.namespace,
        name: this.name,
        apiService: service,
        generator: (path: string): BreadcrumbPath => {
          return this.makeCloudBreadcrumbs(directory, path);
        }
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
    this.rawParameters = parameters;
    const sidecars = [];
    const outputParameters = [];

    for (const param of parameters) {
      if (param.name.startsWith('sys-sidecar-url')) {
        const newSideCar = NodeInfoComponent.paramToSideCar(param);
        if (newSideCar.name !== 'sys filesyncer') {
          sidecars.push(newSideCar);
        }
      } else {
        outputParameters.push(param);
      }
    }

    this.sidecars = sidecars;
    this.outputParameters = outputParameters;

    this.refreshOutputParameters();
  }

  private refreshOutputParameters() {
      const volumeMounts = this.getVolumeMounts(this.template);
      const localFileNavigators = [];

      for (const param of this.rawParameters) {
        if (!param.name.startsWith('sys-sidecar-url')) {
          continue;
        }

        const newSideCar = NodeInfoComponent.paramToSideCar(param);
        if (newSideCar.name === 'sys filesyncer' && this.node.phase === 'Running') {
            const url = '//' + newSideCar.url + '/sys/filesyncer';

            for (const volumeMount of volumeMounts) {

              const fileNavigator = new FileNavigator({
                rootPath: volumeMount.mountPath,
                displayRootPath: '/mnt',
                path: volumeMount.mountPath,
                namespace: this.namespace,
                name: volumeMount.name,
                apiService: new FileSyncerFileApi(this.appAuthService.getAuthToken(), this.httpClient, url),
                timer: true,
                generator: this.makeLocalBreadcrumbs
              });

              localFileNavigators.push(fileNavigator);
            }
        }
      }

      FileNavigator.cleanUp(this.localFileNavigators);
      this.localFileNavigators = localFileNavigators;
  }

  openSidecar(url: string) {
    window.open(url);
  }

  private getVolumeMounts(template: TemplateDefinition) {
    let potentialVolumeMounts = new Array<VolumeMount>();
    if (template.script && template.script.volumeMounts) {
      potentialVolumeMounts = template.script.volumeMounts;
    } else if (template.container && template.container.volumeMounts) {
      potentialVolumeMounts = template.container.volumeMounts;
    }

    return potentialVolumeMounts.filter((volumeMount) => {
      return !volumeMount.name.startsWith('sys-');
    });
  }

  public makeCloudBreadcrumbs(prePath: string, path: string): BreadcrumbPath {
    if (path.startsWith(prePath) ) {
      path = path.substring(prePath.length);
    }

    const preParts = prePath.split('/').filter(value => value !== '');
    const parts = path.split('/').filter(value => value !== '');
    let pathSum = '';


    const pathParts: PathPart[] = [];
    for (const part of preParts) {
      pathParts.push({
        display: part,
        value: part,
        partialPath: prePath,
      });
    }

    pathParts[pathParts.length - 1].clickable = parts.length > 0;

    for (const part of parts) {
      pathSum += '/' + part;

      pathParts.push({
        display: part,
        value: part,
        partialPath: pathSum,
        clickable: true,
      });
    }

    const lastPathPart = pathParts[pathParts.length - 1];
    lastPathPart.clickable = false;

    const isFile = lastPathPart.value.indexOf('.') > -1;

    return {
      pathParts,
      postfix: isFile ? undefined : '/'
    };
  }

  public makeLocalBreadcrumbs(path: string): BreadcrumbPath {
    const parts = path.split('/').filter(value => value !== '');
    let pathSum = '';


    const pathParts: PathPart[] = [];

    for (const part of parts) {
      const clickable = parts.length > 1 && pathParts.length > 0;

      pathSum += '/' + part;

      pathParts.push({
        display: part,
        value: part,
        partialPath: pathSum,
        clickable,
      });
    }

    pathParts[pathParts.length - 1].clickable = false;

    return {
      prefix: '/',
      pathParts
    };
  }

  parseNodePool(): string {
    if (!this.template || !this.template.nodeSelector) {
      return null;
    }

    let originalNodePoolKey = '';
    if (this.nodePoolLabel in this.template.nodeSelector) {
      originalNodePoolKey = this.template.nodeSelector[this.nodePoolLabel];
    } else {
      // Grab the first key
      // tslint:disable-next-line:forin
      for (const key in this.template.nodeSelector) {
        return this.template.nodeSelector[key];
      }
    }

    let nodePoolKey = originalNodePoolKey.replace(/[{}\s]/g, '');

    // If we don't remove any curly braces, then it is not a parameter.
    if (originalNodePoolKey === nodePoolKey) {
      return nodePoolKey;
    }

    const parts = nodePoolKey.split('.');
    nodePoolKey = parts[parts.length - 1];

    const jsonManifest = this.workflow.getJsonManifest();

    const value = jsonManifest.spec.arguments.parameters;

    for (const param of value) {
      if (param.name === nodePoolKey) {
        return param.value;
      }
    }
  }

  getNodePool() {
    this.nodePoolRequestedAt = new Date();
    const requestStartedAt = new Date();

    const value = this.parseNodePool();

    this.configService.getMachineTypeByValue(value).subscribe(res => {
      const timeDifference = requestStartedAt.getTime() - this.nodePoolRequestedAt.getTime();
      if (timeDifference >= 0) {
        this.nodePool = res;
      }
    });
  }
}
