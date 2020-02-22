import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from "@angular/router";

@Component({
  selector: 'app-secrets',
  templateUrl: './secrets.component.html',
  styleUrls: ['./secrets.component.scss']
})
export class SecretsComponent implements OnInit {

  namespace: string;

  constructor(
      private activatedRoute: ActivatedRoute,
      private router: Router
  ) { }

  ngOnInit() {
    this.activatedRoute.paramMap.subscribe(next => {
      this.namespace = next.get('namespace');
    });
  }

  createEnvironmentVariable() {
    this.router.navigate(['/', this.namespace, 'secrets', 'onepanel-default-env', 'create']);
  }
}
