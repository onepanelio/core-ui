import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { CreateWorkflowTemplate, WorkflowTemplateBase, WorkflowTemplateService } from '../workflow-template.service';
import { DagComponent } from '../../dag/dag.component';
import { ActivatedRoute, Route, Router } from '@angular/router';
import { fromEvent } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { NodeRenderer } from '../../node/node.service';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-workflow-template-create',
  templateUrl: './workflow-template-create.component.html',
  styleUrls: ['./workflow-template-create.component.scss'],
  providers: [ WorkflowTemplateService ]
})
export class WorkflowTemplateCreateComponent implements OnInit {
  @ViewChild(DagComponent, {static: false}) dag: DagComponent;
  @ViewChild('templateNameInput', {static: false}) templateNameInput: ElementRef;

  error: {title: string, description: string} = null;

  yamlError: string|null = null;

  manifestText = '';
  manifestTextCurrent = '';
  namespace: string;

  constructor(
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private workflowTemplateService: WorkflowTemplateService) { }

  ngOnInit() {
    this.activatedRoute.paramMap.subscribe(next => {
      this.namespace = next.get('namespace');
    });
  }

  onManifestChange(newManifest: string) {
    this.manifestTextCurrent = newManifest;
    this.yamlError = null;

    try {
      const g = NodeRenderer.createGraphFromManifest(newManifest);
      this.dag.display(g);
    } catch (e) {
      // console.log(e);
      this.yamlError = 'error';
    }
  }

  templates(name: string): string {
    if (name === 'hello-world') {
      return `apiVersion: argoproj.io/v1alpha1
kind: Workflow
metadata:
  generateName: hello-world-
spec:
  entrypoint: whalesay
  templates:
  - name: whalesay
    container:
      image: docker/whalesay:latest
      command: [cowsay]
      args: ["hello world"]`
        ;
    }

    if (name === 'coin-flip') {
      return `# The coinflip example combines the use of a script result,
# along with conditionals, to take a dynamic path in the
# workflow. In this example, depending on the result of the
# first step, 'flip-coin', the template will either run the
# 'heads' step or the 'tails' step.
apiVersion: argoproj.io/v1alpha1
kind: Workflow
metadata:
  generateName: coinflip-
spec:
  entrypoint: coinflip
  templates:
  - name: coinflip
    steps:
    - - name: flip-coin
        template: flip-coin
    - - name: heads
        template: heads
        when: "{{steps.flip-coin.outputs.result}} == heads"
      - name: tails
        template: tails
        when: "{{steps.flip-coin.outputs.result}} == tails"
  - name: flip-coin
    script:
      image: python:alpine3.6
      command: [python]
      source: |
        import random
        result = "heads" if random.randint(0,1) == 0 else "tails"
        print(result)
  - name: heads
    container:
      image: alpine:3.6
      command: [sh, -c]
      args: ["echo \\"it was heads\\""]
  - name: tails
    container:
      image: alpine:3.6
      command: [sh, -c]
      args: ["echo \\"it was tails\\""]`;
    }

    if (name === 'loops-map') {
      return `apiVersion: argoproj.io/v1alpha1
kind: Workflow
metadata:
  generateName: loops-maps-
spec:
  entrypoint: loop-map-example
  templates:
  - name: loop-map-example
    steps:
    - - name: test-linux
        template: cat-os-release
        arguments:
          parameters:
          - name: image
            value: "{{item.image}}"
          - name: tag
            value: "{{item.tag}}"
        withItems:
        - { image: 'debian', tag: '9.1' }
        - { image: 'debian', tag: '8.9' }
        - { image: 'alpine', tag: '3.6' }
        - { image: 'ubuntu', tag: '17.10' }

  - name: cat-os-release
    inputs:
      parameters:
      - name: image
      - name: tag
    container:
      image: "{{inputs.parameters.image}}:{{inputs.parameters.tag}}"
      command: [cat]
      args: [/etc/os-release]
      `;
    }

    return '';
  }

  setManifestTemplate(name: string) {
    const newManifest = this.templates(name);
    this.manifestText = newManifest;
    this.onManifestChange(newManifest);
  }

  clearManifest() {
    this.manifestText = '';
    this.dag.clear();
  }

  save() {
    this.error = null;

    const data: CreateWorkflowTemplate = {
        name: this.templateNameInput.nativeElement.value,
        manifest: this.manifestTextCurrent
    };

    this.workflowTemplateService.create(this.namespace, data)
      .subscribe(res => {
        this.router.navigate(['/', this.namespace, 'workflow-templates', res.uid]);
      }, (err: HttpErrorResponse)  => {
        if (err.status === 409) {
          this.error = {
            title: 'Conflict',
            description: 'There is already a template with that name',
          };

          return;
        }

        this.error = {
          title: 'Error',
          description: 'Unable to create workflow template',
        };
      });
  }
}
