import { Component, Input, OnInit } from '@angular/core';
import { KeyValue } from "../../../api";

@Component({
  selector: 'app-labels-list-view',
  templateUrl: './labels-list-view.component.html',
  styleUrls: ['./labels-list-view.component.scss']
})
export class LabelsListViewComponent implements OnInit {

  @Input() labels = new Array<KeyValue>();

  constructor() { }

  ngOnInit() {
  }

}
