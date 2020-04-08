// reference: https://github.com/kubeflow/pipelines/blob/master/frontend/src/lib/StaticGraphParser.ts
import * as dagre from 'dagre';
import * as yaml from 'js-yaml';

export type nodeType = 'Pod' | 'Resource' | 'DAG' | 'Unknown';

export interface KeyValue<T> extends Array<any> {
  0?: string;
  1?: T;
}

function nodeTemplate(node: any) {
  let html: string = '<div>';
  if (node.type === 'StepGroup' || node.type === 'DAG') {
    html += '<div class=dashed-circle></div>';
  } else {
    html += '<span class=phase></span>';
    html += `<span class=name>
      ${
        node.type === 'StepGroup' || node.type === undefined
          ? node.name
          : node.displayName
      }
      </span>`;
  }
  html += '</div>';

  return html;
}

export class NodeInfo {
  public args: string[];
  public command: string[];
  public condition: string;
  public image: string;
  public inputs: Array<KeyValue<string>>;
  public nodeType: nodeType;
  public outputs: Array<KeyValue<string>>;
  public volumeMounts: Array<KeyValue<string>>;
  public resource: Array<KeyValue<string>>;

  constructor() {
    this.args = [];
    this.command = [];
    this.condition = '';
    this.image = '';
    this.inputs = [[]];
    this.nodeType = 'Unknown';
    this.outputs = [[]];
    this.volumeMounts = [[]];
    this.resource = [[]];
  }
}

export function populateInfoFromTemplate(
  info: NodeInfo,
  template?: any
): NodeInfo {
  if (!template || (!template.container && !template.resource && !template.script)) {
    return info;
  }

  if (template.container) {
    (info.args = template.container.args || []),
      (info.command = template.container.command || []),
      (info.image = template.container.image || '');
    info.volumeMounts = (template.container.volumeMounts || []).map(v => [
      v.mountPath,
      v.name
    ]);
  } else {
    if (
      template.resource &&
      template.resource.action &&
      template.resource.manifest
    ) {
      info.resource = [[template.resource.action, template.resource.manifest]];
    } else {
      info.resource = [[]];
    }
  }

  if (template.inputs) {
    info.inputs = (template.inputs.parameters || []).map(p => [
      p.name,
      p.value || ''
    ]);
  }
  if (template.outputs) {
    info.outputs = (template.outputs.parameters || []).map(p => {
      let value = '';
      if (p.value) {
        value = p.value;
      } else if (p.valueFrom) {
        value =
          p.valueFrom.jqFilter ||
          p.valueFrom.jsonPath ||
          p.valueFrom.parameter ||
          p.valueFrom.path ||
          '';
      }
      return [p.name, value];
    });
  }

  return info;
}

/**
 * Recursively construct the static graph of the Pipeline.
 *
 * @param graph The dagre graph object
 * @param rootTemplateId The current template being explored at this level of recursion
 * @param templates An unchanging map of template name to template and type
 * @param parentFullPath The task that was being examined when the function recursed. This string
 * includes all of the nodes above it. For example, with a graph such as:
 *     A
 *    / \
 *   B   C
 *      / \
 *     D   E
 * where A and C are DAGs, the parentFullPath when rootTemplateId is C would be: /A/C
 */
function buildDag(
  graph: dagre.graphlib.Graph,
  rootTemplateId: string,
  templates: Map<string, { nodeType: nodeType; template: any }>,
  alreadyVisited: Map<string, string>,
  parentFullPath: string
): void {
  const root = templates.get(rootTemplateId);

  if (root && root.nodeType === 'DAG') {
    // Mark that we have visited this DAG, and save the original qualified path to it.
    alreadyVisited.set(rootTemplateId, parentFullPath || '/' + rootTemplateId);
    const template = root.template;

    (template.dag.tasks || []).forEach(task => {
      const nodeId = parentFullPath + '/' + task.name;

      // If the user specifies an exit handler, then the compiler will wrap the entire Pipeline
      // within an additional DAG template prefixed with 'exit-handler'.
      // If this is the case, we simply treat it as the root of the graph and work from there
      if (task.name.startsWith('exit-handler')) {
        buildDag(graph, task.template, templates, alreadyVisited, '');
        return;
      }

      // If this task has already been visited, retrieve the qualified path name that was assigned
      // to it, add an edge, and move on to the next task
      if (alreadyVisited.has(task.name)) {
        graph.setEdge(parentFullPath, alreadyVisited.get(task.name)!);
        return;
      }

      // Parent here will be the task that pointed to this DAG template.
      // Within a DAG template, tasks can have dependencies on one another, and long chains of
      // dependencies can be present within a single DAG. In these cases, we choose not to draw an
      // edge from the DAG node itself to these tasks with dependencies because such an edge would
      // not be meaningful to the user. For example, consider a DAG A with two tasks, B and C, where
      // task C depends on the output of task B. C is a task of A, but it's much more semantically
      // important that C depends on B, so to avoid cluttering the graph, we simply omit the edge
      // between A and C:
      //      A                  A
      //    /   \    becomes    /
      //   B <-- C             B
      //                      /
      //                     C
      if (parentFullPath && !task.dependencies) {
        graph.setEdge(parentFullPath, nodeId);
      }

      // This object contains information about the node that we display to the user when they
      // click on a node in the graph
      const info = new NodeInfo();
      if (task.when) {
        info.condition = task.when;
      }

      // 'Child' here is the template that this task points to. This template should either be a
      // DAG, in which case we recurse, or a pod/resource which can be thought of as a
      // leaf node
      const child = templates.get(task.template);
      if (child) {
        if (child.nodeType === 'DAG') {
          // TODO: Handle self referencing templates better
          if (rootTemplateId !== task.template) {
            buildDag(graph, task.template, templates, alreadyVisited, nodeId);
          }
        } else if (
          child.nodeType === 'Pod' ||
          child.nodeType === 'Resource'
        ) {
          info.nodeType = child.nodeType;
          populateInfoFromTemplate(info, child.template);
        } else {
          throw new Error(
            `Unknown nodetype: ${child.nodeType} on workflow template: ${
              child.template
            }`
          );
        }
      }

      info.nodeType = child.nodeType;
      graph.setNode(nodeId, {
        labelType: 'html',
        label: nodeTemplate(task),
        padding: 0,
        class: 'skipped',
        info
      });

      // DAG tasks can indicate dependencies which are graphically shown as parents with edges
      // pointing to their children (the task(s)).
      // TODO: The addition of the parent prefix to the dependency here is only valid if nodes only
      // ever directly depend on their siblings. This is true now but may change in the future, and
      // this will need to be updated.
      (task.dependencies || []).forEach(dep =>
        graph.setEdge(parentFullPath + '/' + dep, nodeId)
      );
    });
  }
}

export function createGraphFromWorkflowTemplate(workflowTemplate: any): dagre.graphlib.Graph {
  const graph = new dagre.graphlib.Graph();
  graph.setGraph({});
  graph.setDefaultEdgeLabel(() => ({}));
  const manifest = yaml.safeLoad(workflowTemplate.manifest);

  if (!manifest.spec || !manifest.spec.templates) {
    throw new Error(
      'Could not generate graph. Provided Pipeline had no components.'
    );
  }

  const workflowTemplates = manifest.spec.templates;

  const templates = new Map<string, { nodeType: nodeType; template: any }>();

  // Iterate through the workflow's templates to construct a map which will be used to traverse and
  // construct the graph
  for (const template of workflowTemplates.filter(t => !!t && !!t.name)) {
    // Argo allows specifying a single global exit handler. We also highlight that node
    if (template.name === manifest.spec.onExit) {
      const info = new NodeInfo();
      populateInfoFromTemplate(info, template);
      graph.setNode(template.name, {
        info,
        label: 'onExit - ' + template.name
      });
    }

    if (template.container || template.script) {
      templates.set(template.name, { nodeType: 'Pod', template });
    } else if (template.resource) {
      templates.set(template.name, { nodeType: 'Resource', template });
    } else if (template.dag) {
      templates.set(template.name, { nodeType: 'DAG', template });
    } else {
      console.log(
        `Template: ${template.name} was neither a Container, Resource, Script nor a DAG`
      );
    }
  }

  buildDag(graph, manifest.spec.entrypoint, templates, new Map(), '');

  // If template is not a DAG
  if (graph.nodeCount() === 0) {
    const entryPointTemplate = workflowTemplates.find(
      t => t.name === manifest.spec.entrypoint
    );
    if (entryPointTemplate) {
      graph.setNode(entryPointTemplate.name, {
        label: entryPointTemplate.name
      });
    }
  }

  return graph;
}

export function populateInfoFromNodeStatus(
  info: NodeInfo,
  nodeStatus?: any
): NodeInfo {
  info.nodeType = nodeStatus.type;
  return info
}

export function createGraphFromWorkflowStatus(workflowStatus: any): dagre.graphlib.Graph {
  const status = JSON.parse(workflowStatus);
  
  const graph = new dagre.graphlib.Graph();
  graph.setGraph({});
  graph.setDefaultEdgeLabel(() => ({}));

  Object.keys(status.nodes).forEach(key => {
    const nodeStatus = status.nodes[key];
    
    const info = new NodeInfo();
    populateInfoFromNodeStatus(info, nodeStatus);
    
    graph.setNode(nodeStatus.id, {
      labelType: 'html',
      label: nodeTemplate(nodeStatus),
      padding: 0,
      class: nodeStatus.phase.toLowerCase(),
      info
    });
  });

  Object.keys(status.nodes).forEach(key => {
    const nodeStatus = status.nodes[key];
    
    if (nodeStatus.children !== undefined) {
      nodeStatus.children.forEach((child: any) => {
        graph.setEdge(nodeStatus.id, child, {});
      });
    }
  });

  return graph
}