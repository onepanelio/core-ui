import { Component, Input, OnInit } from '@angular/core';
import { Parameter } from "../../../api";

@Component({
  selector: 'app-workflow-parameter',
  templateUrl: './workflow-parameter.component.html',
  styleUrls: ['./workflow-parameter.component.scss']
})
export class WorkflowParameterComponent implements OnInit {
  @Input() parameter: Parameter;

  constructor() { }

  ngOnInit() {
  }
}
