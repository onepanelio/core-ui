import { Component, EventEmitter, Input, OnInit, Output, ViewEncapsulation } from '@angular/core';
import * as d3 from 'd3';
import * as dagre from 'dagre';
import * as dagreD3 from 'dagre-d3';
import { NodeInfo } from "../node/node.service";

export interface DagClickEvent {
  nodeId: string;
  identifier: any;
  info: NodeInfo;
}

@Component({
  selector: 'app-dag',
  templateUrl: './dag.component.html',
  styleUrls: ['./dag.component.scss'],
})
export class DagComponent implements OnInit {
  private render;
  private svg;
  private inner;
  private currentGraph;

  @Input() maxWidth = -1;
  @Input() maxHeight = -1;
  @Input() identifier: any = null;

  @Output() nodeClicked = new EventEmitter<DagClickEvent>();

  private init = false;

  private selectedNodeId: string|null = null;

  constructor() { }

  ngOnInit() {
    this.render = new dagreD3.render();
    this.svg = d3.select('svg');
    this.svg.attr('height', '100%');
    this.svg.attr('width', '100%');
    this.inner = this.svg.select('g');
    this.init = true;
    this.setupZoom();
  }

  display(g: any) {
    this.currentGraph = g;

    // Clear old listeners
    this.svg.selectAll('g.node').on('click', null);

    // Run the renderer. This is what draws the final graph.
    try {
      this.render(this.inner, g);

      // Persist the node selection.
      if(this.selectedNodeId) {
        this.svg.select(`#${this.selectedNodeId}`).classed('selected', true);
      }
    } catch (e) {
      console.error(e);
    }

    this.svg.selectAll('g.node').on('click', (id: any, selectedIndex: any, nodes: any) => {
      this.selectedNodeId = id;

      this.svg.selectAll('g.node.selected').classed('selected', false);
      this.svg.select(`#${this.selectedNodeId}`).classed('selected', true);

      const nodeData = g.node(id);

      this.nodeClicked.emit({
        nodeId: id,
        identifier: this.identifier,
        info: nodeData.info,
      });

      console.log(nodeData.info);
    });
  }

  clear() {
    const g = new dagreD3.graphlib.Graph()
      .setGraph({});
    this.render(this.inner, g);
  }

  setupZoom() {
    const inner = this.inner;

    const zoom = d3.zoom().on('zoom', () => {
      inner.attr('transform', d3.event.transform);
    });

    this.svg.call(zoom);
  }

  // TODO - this method works right now, but the transform is gone the moment the user starts to zoom around.
  center() {
    const xCenterOffset = (this.svg.property('clientWidth') - this.currentGraph.graph().width) / 2;
    this.inner.attr('transform', 'translate(' + xCenterOffset + ', 20)');
  }
}
