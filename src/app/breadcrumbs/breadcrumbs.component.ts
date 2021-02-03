import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

export interface BreadcrumbEvent {
  index: number;
  part: string;
}

@Component({
  selector: 'app-breadcrumbs',
  templateUrl: './breadcrumbs.component.html',
  styleUrls: ['./breadcrumbs.component.scss']
})
export class BreadcrumbsComponent implements OnInit {
  @Input() parts = new Array<string>();
  @Output() breadcrumbClick = new EventEmitter<BreadcrumbEvent>();

  constructor() { }

  ngOnInit() {
  }

  onClick(index: number, part: string) {
    this.breadcrumbClick.emit({
      index,
      part
    });
  }
}
