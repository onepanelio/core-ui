import {Component, Input, OnInit} from '@angular/core';

@Component({
  selector: 'app-node',
  templateUrl: './node.component.html',
  styleUrls: ['./node.component.scss']
})
export class NodeComponent implements OnInit {
  @Input() node: any;

  get name(): string {
    if (!this.node) {
      return '';
    }

    if (this.node.type === 'StepGroup' || this.node.type === undefined) {
      return this.node.name;
    }

    return this.node.displayName;
  }

  constructor() { }

  ngOnInit() {
  }
}
