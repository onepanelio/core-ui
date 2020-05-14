import { Component, Input, OnInit } from '@angular/core';
import { WorkflowExecutionStatisticReport, WorkflowTemplate } from "../../../api";

@Component({
  selector: 'app-workflow-template-status',
  templateUrl: './workflow-template-status.component.html',
  styleUrls: ['./workflow-template-status.component.scss']
})
export class WorkflowTemplateStatusComponent implements OnInit {
  @Input() colors = ['#01579B', '#37AD58', '#D32345', '#D32345'];
  @Input() labels = [];

  styles = [];
  private _values = [];
  private valuesSum = 0;
  @Input() set values(values: Array<number>) {
    if(!values) {
      values = [];
    }

    this._values = values;

    let zeroValues = 0;

    let sum = 0;
    for(const value of values) {
      sum += value;
      if (value === 0) {
        zeroValues++;
      }
    }

    let newStyles = [];

    for(let i = 0; i < values.length; i++) {
      const value = values[i];

      const percent = (value / sum) * 100;

      let newStyle = {
        height: '10px',
        'background-color': this.colors[i],
      };

      let width = `calc(${percent}% - 3px)`;
      if((i === values.length - 1) || (i < (values.length - 1) && values[i + 1] === 0)) {
        width = `${percent}%`;
      } else {
        newStyle["margin-right"] = "3px";
      }
      newStyle['width'] = width;


      newStyles.push(newStyle);
    }

    this.valuesSum = sum;
    this.styles = newStyles;

    this.tooltips = [];
    for(let i = 0; i < values.length; i++) {
      this.tooltips.push(this.toolTipForIndex(i));
    }
  }
  get values(): Array<number> {
    return this._values;
  }

  @Input() set template(value: WorkflowExecutionStatisticReport) {
    const running = value.running || 0;
    const completed = value.completed || 0;
    const failed = value.failed || 0;
    const terminated = value.terminated || 0;

    this.values = [running, completed, failed, terminated];
  }

  tooltips = [];

  constructor() { }

  ngOnInit() {
  }

  toolTipForIndex(index: number): string {
    let word = 'Running:';

    if(index === 1) {
      word = 'Completed:';
    } else if(index === 2) {
      word = 'Failed:';
    } else if(index === 3) {
      word = 'Terminated';
    }

    return `${word} ${this.values[index]}`;
  }
}
