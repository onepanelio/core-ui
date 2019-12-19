import * as d3 from "d3";
import * as dagreD3 from "dagre-d3";
import * as yaml from "js-yaml";
import * as streams from "./streams";

let g = new dagreD3.graphlib.Graph().setGraph({});

let svg = d3.select("svg"),
  inner = svg.select("g");
// Create the renderer
let render = new dagreD3.render();

let drawNode = (node: any) => {
  var html = "<div>";
  if (node.type === "StepGroup") {
    html += "<div class=dashed-circle></div>";
  } else {
    html += "<span class=phase></span>";
    html +=
      "<span class=name>" +
      (node.type === "StepGroup" ? node.name : node.displayName) +
      "</span>";
  }
  html += "</div>";
  g.setNode(node.id, {
    labelType: "html",
    label: html,
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
  document.getElementById("template").value = yaml.safeDump(nodeTemplate);
};

let drawWorkflow = workflow => {
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
  render(inner, g);

  // Capture click events
  svg.selectAll("g.node").on("click", id => {
    displayInfo(status.nodes[id], workflow);
  });
};

drawWorkflow(streams["stream0"]);
// let i = 1;
// setInterval(() => {
//   drawWorkflow(JSON.parse(streams["stream" + (i % 3)]));
//   i++;
// }, 3000);

// Set up zoom support
let zoom = d3.zoom().on("zoom", () => {
  inner.attr("transform", d3.event.transform);
});
let initialScale = 1;

svg.call(zoom);
svg.call(
  zoom.transform,
  d3.zoomIdentity
    .translate((svg.attr("width") - g.graph().width * initialScale) / 800, 0)
    .scale(initialScale)
);
svg.attr("width", g.graph().width * initialScale + 600);
svg.attr("height", g.graph().height * initialScale + 100);
