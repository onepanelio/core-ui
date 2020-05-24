import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

export interface WorkflowTemplateSelectHeader {
  image: string;
  title: string;
}

export interface WorkflowTemplateSelected {
  name: string;
  manifest: string;
}

export interface WorkflowTemplateSelectItem {
  header: WorkflowTemplateSelectHeader;
  children: Array<WorkflowTemplateSelected>
}

@Component({
  selector: 'app-workflow-template-select',
  templateUrl: './workflow-template-select.component.html',
  styleUrls: ['./workflow-template-select.component.scss']
})
export class WorkflowTemplateSelectComponent implements OnInit {
  @Output() templateSelected = new EventEmitter<WorkflowTemplateSelected>();
  private static workflowTemplateSamples: WorkflowTemplateSelected[] = [
    {
      name: "DAG",
      manifest: `# The template to use as entrypoint
entrypoint: main
templates:
- name: main            # Name of template
  dag:                  # Indicates that this is a DAG template
    tasks:
    - name: A           # First task to execute
      template: echo    # The template to use for first task in DAG
      arguments:
        parameters:
        - name: message
          value: A
    - name: B
      dependencies: [A]
      template: echo
      arguments:
        parameters:
        - name: message
          value: B
    - name: C
      dependencies: [A]
      template: echo
      arguments:
        parameters:
        - name: message
          value: C
    - name: D
      dependencies: [B, C]
      template: echo
      arguments:
        parameters:
        - name: message
          value: D
- name: echo
  inputs:
    parameters:
    - name: message
  container:
    image: alpine:3.7
    command: [echo, "{{inputs.parameters.message}}"]`
    },
    {
      name: "Nested DAG",
      manifest: "entrypoint: diamond\r\ntemplates:\r\n- name: echo\r\n  inputs:\r\n    parameters:\r\n    - name: message\r\n  container:\r\n    image: alpine:3.7\r\n    command: [echo, \"{{inputs.parameters.message}}\"]\r\n- name: diamond\r\n  dag:\r\n    tasks:\r\n    - name: A\r\n      template: nested-diamond\r\n      arguments:\r\n        parameters: [{name: message, value: A}]\r\n    - name: B\r\n      dependencies: [A]\r\n      template: nested-diamond\r\n      arguments:\r\n        parameters: [{name: message, value: B}]\r\n    - name: C\r\n      dependencies: [A]\r\n      template: nested-diamond\r\n      arguments:\r\n        parameters: [{name: message, value: C}]\r\n    - name: D\r\n      dependencies: [B, C]\r\n      template: nested-diamond\r\n      arguments:\r\n        parameters: [{name: message, value: D}]\r\n- name: nested-diamond\r\n  inputs:\r\n    parameters:\r\n    - name: message\r\n  dag:\r\n    tasks:\r\n    - name: A\r\n      template: echo\r\n      arguments:\r\n        parameters: [{name: message, value: \"{{inputs.parameters.message}}A\"}]\r\n    - name: B\r\n      dependencies: [A]\r\n      template: echo\r\n      arguments:\r\n        parameters: [{name: message, value: \"{{inputs.parameters.message}}B\"}]\r\n    - name: C\r\n      dependencies: [A]\r\n      template: echo\r\n      arguments:\r\n        parameters: [{name: message, value: \"{{inputs.parameters.message}}C\"}]\r\n    - name: D\r\n      dependencies: [B, C]\r\n      template: echo\r\n      arguments:\r\n          parameters: [{name: message, value: \"{{inputs.parameters.message}}D\"}]"
    }
  ];

  previousSelectedTemplate: string = null;
  _selectedTemplate: string = 'new';

  @Input() set selectedTemplate(value: string) {
    if(value !== this.previousSelectedTemplate) {
      this.previousSelectedTemplate = this._selectedTemplate;
    }

    this._selectedTemplate = value;
  }
  get selectedTemplate(): string {
    return this._selectedTemplate;
  }

  @Input() items: Array<WorkflowTemplateSelectItem> = [{
    header: {
      title: 'Blank template',
      image: '/assets/images/workflows-blank-icon.svg'
    }, children: [{
      name: 'New',
      manifest: '',
    }]
  }, {
    header: {
      title: 'Templates',
      image: '/assets/images/workflows-templates-icon.svg'
    }, children: WorkflowTemplateSelectComponent.workflowTemplateSamples
  }]

  constructor() { }

  ngOnInit() {
  }

  selectTemplate(name: string) {
    this.selectedTemplate = name;

    const workflowTemplateList = this.items.find(list => {
      return list.children.find(item => item.name === name);
    });

    if(!workflowTemplateList) {
      return;
    }

    const workflowTemplateItem = workflowTemplateList.children.find(item => item.name === name);

    if(!workflowTemplateItem) {
      return;
    }

    this.templateSelected.emit(workflowTemplateItem);
  }

  undo() {
    this.selectedTemplate = this.previousSelectedTemplate;
  }
}
