import { Component, EventEmitter, Input, OnInit, Output, ViewEncapsulation } from '@angular/core';
import * as d3 from 'd3';
import * as dagre from 'dagre';
import * as dagreD3 from 'dagre-d3';

export interface DagClickEvent {
  nodeId: string;
  identifier: any;
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

    // Run the renderer. This is what draws the final graph.
    try {
      this.render(this.inner, g);
    } catch (e) {
      console.error(e);
    }

    // Clear old listeners
    this.svg.selectAll('g.node').on('click', null);

    this.svg.selectAll('g.node').on('click', (id: any, selectedIndex: any, nodes: any) => {
      this.svg.selectAll('g.node.selected').classed('selected', false);
      const selectedNode = nodes[selectedIndex];
      const selection = d3.select(selectedNode);
      selection.classed('selected', true);

      this.nodeClicked.emit({
        nodeId: id,
        identifier: this.identifier
      });
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
