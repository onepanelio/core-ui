import { Component, Input, OnInit } from '@angular/core';
import { KeyValue } from "../../../api";

@Component({
  selector: 'app-labels-viewer',
  templateUrl: './labels-viewer.component.html',
  styleUrls: ['./labels-viewer.component.scss']
})
export class LabelsViewerComponent implements OnInit {

  @Input() labels = new Array<KeyValue>();
  @Input() loading = false;

  constructor() { }

  ngOnInit() {
  }

}
