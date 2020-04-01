import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-workflow-parameter',
  templateUrl: './workflow-parameter.component.html',
  styleUrls: ['./workflow-parameter.component.scss']
})
export class WorkflowParameterComponent implements OnInit {
  @Input() key: string;
  @Input() value: string;

  constructor() { }

  ngOnInit() {
  }
}
