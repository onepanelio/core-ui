import { Component, Input, OnInit } from '@angular/core';
import { NodeParameter } from "../../node/node.service";

@Component({
  selector: 'app-parameter',
  templateUrl: './parameter.component.html',
  styleUrls: ['./parameter.component.scss']
})
export class ParameterComponent implements OnInit {

  private _parameter: NodeParameter;
  @Input() set parameter(value: NodeParameter) {
    this._parameter = value;
    let items = [];

    this.parseParameters(0, value.name, value.value, items);

    this.items = items.reverse();
  }

  items: Array<{ depth: number, key: string, value?: string }> = [];

  constructor() { }

  ngOnInit() {
  }

  parseParameters(depth: number, key: string, value: string, results: Array<any>) {
    let subkeyCount = 0;

    try {
      let parsed = JSON.parse(value);

      for(let subKey in parsed) {
        subkeyCount++;
        this.parseParameters(depth + 1, subKey, parsed[subKey], results);
      }
    } catch (e) {
    }

    let resultValue = subkeyCount === 0 ? value : undefined;

    results.push( {
      depth: depth,
      key: key,
      value: resultValue,
    });
  }

  getItemDepthClass(depth: number) {
    let data = {};
    data[`depth-${depth}`] = true;

    return data;
  }
}
