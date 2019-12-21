import * as d3 from "d3";
import * as dagreD3 from "dagre-d3";
import * as yaml from "js-yaml";
import * as streams from "./streams";
import { createGraph, nodeTemplate } from "./graph-parser";

let drawNode = (node: any) => {
  g.setNode(node.id, {
    labelType: "html",
    label: nodeTemplate(node),
    padding: 0,
    class: node.phase.toLowerCase()
  });
};

let drawEdges = (node: any) => {
  if (node.children !== undefined) {
    node.children.forEach(child => {
      g.setEdge(node.id, child, {});
    });
  }
};

let displayInfo = (node: any, workflow: any) => {
  let workflowTemplate = yaml.safeLoad(workflow.workflowTemplate.manifest);
  let nodeTemplate = workflowTemplate.spec.templates.find(
    t => t.name === node.templateName
  );
  document.getElementById("name").innerHTML = node.templateName;
  (document.getElementById(
    "template"
  ) as HTMLInputElement).value = yaml.safeDump(nodeTemplate);
};

let drawWorkflowGraph = (workflow: any) => {
  // Add nodes to the graph. The first argument is the node id. The second is
  // metadata about the node.
  let status = JSON.parse(workflow.status);
  Object.keys(status.nodes).forEach(key => {
    drawNode(status.nodes[key]);
  });

  Object.keys(status.nodes).forEach(key => {
    drawEdges(status.nodes[key]);
  });

  // Run the renderer. This is what draws the final graph.
  let render = new dagreD3.render();
  //g = createGraph(streams.stream0.workflowTemplate);
  console.log(g);
  render(inner, g);

  // Capture click events
  svg.selectAll("g.node").on("click", id => {
    displayInfo(status.nodes[id], workflow);
  });
};

let setupZoomSupport = () => {
  let zoom = d3.zoom().on("zoom", () => {
    inner.attr("transform", d3.event.transform);
  });

  svg.call(zoom);
  svg.attr("width", 800);
  svg.attr("height", "100%");
};

let svg = d3.select("svg"),
  inner = svg.select("g");

let g = new dagreD3.graphlib.Graph().setGraph({});

drawWorkflowGraph(streams["stream0"]);
setupZoomSupport();
