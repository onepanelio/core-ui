import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-artifact-parameter',
  templateUrl: './artifact-parameter.component.html',
  styleUrls: ['./artifact-parameter.component.scss']
})
export class ArtifactParameterComponent implements OnInit {
  @Input() parameter;

  constructor() { }

  ngOnInit() {
  }

}
