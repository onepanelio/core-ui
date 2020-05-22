import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-artifact-parameter',
  templateUrl: './artifact-parameter.component.html',
  styleUrls: ['./artifact-parameter.component.scss']
})
export class ArtifactParameterComponent implements OnInit {
  _parameter: any;
  @Input() set parameter(value: any) {
    this._parameter = value;
    console.log(value);
  }
  get parameter() {
    return this._parameter;
  }

  constructor() { }

  ngOnInit() {
  }

}
