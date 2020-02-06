import { Component, OnInit } from '@angular/core';
import 'brace';
import 'brace/mode/yaml';
import { NamespaceService } from "./namespace/namespace.service";
import { Router } from "@angular/router";
import { MatSnackBar } from "@angular/material/snack-bar";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
  title = 'onepanel-core-ui';
  selectedNamespace: string;
  namespaces = [];

  constructor(private namespaceService: NamespaceService,
              private router: Router,
              private snackbar: MatSnackBar) {
    this.selectedNamespace = namespaceService.activeNamespace;
  }

  ngOnInit(): void {
    this.namespaceService.listNamespaces()
        .subscribe( res => {
          if(!res.count) {
            return;
          }
          this.namespaces = res.namespaces;
        }, err => {
          this.namespaces = [{name: 'default'}];
        })
  }


  onNamespaceChange() {
    if (this.namespaceService.activeNamespace === this.selectedNamespace) {
      return;
    }

    this.namespaceService.activeNamespace = this.selectedNamespace;
    this.snackbar.open(`Switched to namespace '${this.selectedNamespace}'`, 'OK');
    this.router.navigate(['/', this.namespaceService.activeNamespace, 'workflow-templates'])
  }
}
