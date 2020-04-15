import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { NodeRenderer } from "../node/node.service";
import { DagComponent } from "../dag/dag.component";
import { AceEditorComponent } from "ng2-ace-editor";
import * as yaml from 'js-yaml';
import * as ace from 'brace';
import { Alert } from "../alert/alert";
import { WorkflowExecuteDialogComponent } from "../workflow/workflow-execute-dialog/workflow-execute-dialog.component";
const aceRange = ace.acequire('ace/range').Range;

@Component({
  selector: 'app-manifest-dag-editor',
  templateUrl: './manifest-dag-editor.component.html',
  styleUrls: ['./manifest-dag-editor.component.scss']
})
export class ManifestDagEditorComponent implements OnInit {
  @ViewChild(AceEditorComponent, {static: false}) aceEditor: AceEditorComponent;
  @ViewChild(DagComponent, {static: false}) dag: DagComponent;

  @Input() manifestText: string;
  @Input() serverError: Alert;

  showingRender: boolean = true;
  manifestTextCurrent: string;
  errorMarkerId;

  parameters = new Array<FieldData>();

  constructor() { }

  ngOnInit() {
  }

  onManifestChange(newManifest: string) {
    this.manifestTextCurrent = newManifest;

    if(newManifest === '') {
      this.dag.clear();
      return;
    }

    if(this.errorMarkerId) {
      this.aceEditor.getEditor().session.removeMarker(this.errorMarkerId)
    }

    try {
      const g = NodeRenderer.createGraphFromManifest(newManifest);
      this.dag.display(g);
      this.updateParameters(newManifest);
      setTimeout( () => {
        this.serverError = null;
      });
    }
    catch (e) {
      if(e instanceof yaml.YAMLException) {
        const line = e.mark.line + 1;
        const column = e.mark.column + 1;

        const codeErrorRange = new aceRange(line - 1, 0, line - 1, column);
        this.errorMarkerId = this.aceEditor.getEditor().session.addMarker(codeErrorRange, "highlight-error", "fullLine");

        this.serverError = {
          message: e.reason + " at line: " + line + " column: " + column,
          type: 'danger'
        };
      }
    }
  }

  private updateParameters(manifest: string) {
    let previousParameters = this.parameters;
    try {
      this.parameters = WorkflowExecuteDialogComponent.pluckParameters(manifest);
    } catch (e) {
      this.parameters = previousParameters;
    }
  }

  toggleFormRender() {
    this.showingRender = !this.showingRender;
  }
}
