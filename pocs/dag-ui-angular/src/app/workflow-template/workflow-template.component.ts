import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-workflow-template',
  templateUrl: './workflow-template.component.html',
  styleUrls: ['./workflow-template.component.scss']
})
export class WorkflowTemplateComponent implements OnInit {

  namespace: string;

  constructor(private activatedRoute: ActivatedRoute) { }

  ngOnInit() {
    this.activatedRoute.paramMap.subscribe(next => {
      this.namespace = next.get('namespace');
    });
  }
}
