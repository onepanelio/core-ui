import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

export interface WorkflowTemplateSelected {
  name: string;
  manifest: string;
}

@Component({
  selector: 'app-workflow-template-select',
  templateUrl: './workflow-template-select.component.html',
  styleUrls: ['./workflow-template-select.component.scss']
})
export class WorkflowTemplateSelectComponent implements OnInit {
  @Output() templateSelected = new EventEmitter<WorkflowTemplateSelected>();
  @Input() workflowTemplateSamples: WorkflowTemplateSelected[] = [
    {
      name: 'Hello world',
      manifest: `apiVersion: argoproj.io/v1alpha1
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
    },
    {
      name: 'Coin flip',
      manifest: `# The coinflip example combines the use of a script result,
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
      args: ["echo \\"it was tails\\""]`,
    },
    {
      name: 'Loops map',
      manifest: `apiVersion: argoproj.io/v1alpha1
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
      `,
    },
    {
      name: "Sample DAG",
      manifest: "apiVersion: argoproj.io\/v1alpha1\r\nkind: Workflow\r\nmetadata:\r\n  generateName: dag-nested-\r\nspec:\r\n  entrypoint: diamond\r\n  templates:\r\n  - name: echo\r\n    inputs:\r\n      parameters:\r\n      - name: message\r\n    container:\r\n      image: alpine:3.7\r\n      command: [echo, \"{{inputs.parameters.message}}\"]\r\n  - name: diamond\r\n    dag:\r\n      tasks:\r\n      - name: A\r\n        template: nested-diamond\r\n        arguments:\r\n          parameters: [{name: message, value: A}]\r\n      - name: B\r\n        dependencies: [A]\r\n        template: nested-diamond\r\n        arguments:\r\n          parameters: [{name: message, value: B}]\r\n      - name: C\r\n        dependencies: [A]\r\n        template: nested-diamond\r\n        arguments:\r\n          parameters: [{name: message, value: C}]\r\n      - name: D\r\n        dependencies: [B, C]\r\n        template: nested-diamond\r\n        arguments:\r\n          parameters: [{name: message, value: D}]\r\n  - name: nested-diamond\r\n    inputs:\r\n      parameters:\r\n      - name: message\r\n    dag:\r\n      tasks:\r\n      - name: A\r\n        template: echo\r\n        arguments:\r\n          parameters: [{name: message, value: \"{{inputs.parameters.message}}A\"}]\r\n      - name: B\r\n        dependencies: [A]\r\n        template: echo\r\n        arguments:\r\n          parameters: [{name: message, value: \"{{inputs.parameters.message}}B\"}]\r\n      - name: C\r\n        dependencies: [A]\r\n        template: echo\r\n        arguments:\r\n          parameters: [{name: message, value: \"{{inputs.parameters.message}}C\"}]\r\n      - name: D\r\n        dependencies: [B, C]\r\n        template: echo\r\n        arguments:\r\n          parameters: [{name: message, value: \"{{inputs.parameters.message}}D\"}]"
    }
  ];

  selectedTemplate: string = 'new';

  constructor() { }

  ngOnInit() {
  }

  selectTemplate(name: string) {
    this.selectedTemplate = name;

    if (name === 'new') {
      this.templateSelected.emit({
        name: 'new',
        manifest: '',
      });
      return;
    }

    const workflowTemplateSample = this.workflowTemplateSamples.find(value => value.name === name);

    if(!workflowTemplateSample) {
      return;
    }

    this.templateSelected.emit(workflowTemplateSample);
  }
}
