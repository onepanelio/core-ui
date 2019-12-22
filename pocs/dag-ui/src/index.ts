import * as d3 from "d3";
import * as dagreD3 from "dagre-d3";
import { createGraphFromWorkflowTemplate, createGraphFromWorkflowStatus } from "./graph-parser";
import * as request from "request-promise-native";

let displayInfo = (node: any) => {
  document.getElementById("name").innerHTML = node.info.nodeType;
  // (document.getElementById(
  //   "template"
  // ) as HTMLInputElement).value = yaml.safeDump(node.info);
  console.log(node);
};

let setupZoomSupport = () => {
  let zoom = d3.zoom().on("zoom", () => {
    inner.attr("transform", d3.event.transform);
  });

  svg.call(zoom);
  svg.attr("width", 800);
  svg.attr("height", "100%");
};

let getWorkflow = async (namespace: string, name: string): Promise<any> => {
  var options = {
    uri: `http://localhost:8888/apis/v1beta1/${namespace}/workflows/${name}`
  };

  let workflow = JSON.parse(await request.get(options));
  
  return workflow;
};

let svg = d3.select("svg"),
  inner = svg.select("g");

(async () => {
  let workflow = await getWorkflow("rushtehrani", "dag-diamond-coinflip-7x4pb");
  // draw workflow template
  let g = createGraphFromWorkflowTemplate(workflow.workflowTemplate);
  // draw executed workflow
  g = createGraphFromWorkflowStatus(workflow.status);
  
  // Run the renderer. This is what draws the final graph.
  let render = new dagreD3.render();
  render(inner, g);
  
  svg.selectAll("g.node").on("click", id => {
    displayInfo(g.node(id));
  });

  setupZoomSupport();
})();



