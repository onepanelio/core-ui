import * as d3 from 'd3';
import * as dagre from 'dagre';
import * as dagreD3 from 'dagre-d3';
import { createGraphFromWorkflowTemplate, createGraphFromWorkflowStatus } from './graph-parser';
import url from 'url';

let displayInfo = (node: any) => {
  document.getElementById('name').innerHTML = node.info.nodeType;
  // (document.getElementById(
  //   'template'
  // ) as HTMLInputElement).value = yaml.safeDump(node.info);
  console.log(node);
};

let setupZoomSupport = () => {
  let zoom = d3.zoom().on('zoom', () => {
    inner.attr('transform', d3.event.transform);
  });

  svg.call(zoom);
  svg.attr('width', 800);
  svg.attr('height', '100%');
};

let watchWorkflow = (namespace: string, name: string) => {
  return new WebSocket(`ws://localhost:8888/apis/v1beta1/${namespace}/workflows/${name}/watch`);
};

const svg = d3.select('svg'),
  inner = svg.select('g'),
  render = new dagreD3.render(),
  uri = url.parse(document.location.href),
  websocket = watchWorkflow('rushtehrani', 'dag-nested-mwz56');

let g = new dagre.graphlib.Graph();

websocket.onmessage = (event: any) => {
  let data = JSON.parse(event.data);
  if (uri.query === 'template') {
    // draw workflow template
    g = createGraphFromWorkflowTemplate(data.result.workflowTemplate);
  } else {
    // draw executed workflow
    g = createGraphFromWorkflowStatus(data.result.status);
  }

  // Run the renderer. This is what draws theq final graph.
  render(inner, g);

  svg.selectAll('g.node').on('click', (id: any) => {
    displayInfo(g.node(id));
  });
};

setupZoomSupport();



