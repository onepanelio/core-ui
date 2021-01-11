import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { NodeRenderer } from '../node/node.service';
import { DagComponent } from '../dag/dag.component';
import { AceEditorComponent } from 'ng2-ace-editor';
import { Alert } from '../alert/alert';
import { WorkflowExecuteDialogComponent } from '../workflow/workflow-execute-dialog/workflow-execute-dialog.component';
import { Observable, of } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import { Parameter } from '../../api';
import * as yaml from 'js-yaml';
import * as ace from 'brace';
const aceRange = ace.acequire('ace/range').Range;

type ManifestDagEditorState = 'editor-and-dag' | 'editor-and-parameters' | 'editor' | 'transitioning';
type ManifestDagRenderState = 'dag' | 'parameters';

@Component({
  selector: 'app-manifest-dag-editor',
  templateUrl: './manifest-dag-editor.component.html',
  styleUrls: ['./manifest-dag-editor.component.scss']
})
export class ManifestDagEditorComponent implements OnInit {
  @ViewChild(AceEditorComponent, {static: false}) aceEditor: AceEditorComponent;
  @ViewChild(DagComponent, {static: false}) dag: DagComponent;

  /**
   * manifestText is the input, starting text, to put into the editor.
   */
  @Input() manifestText: string;

  /**
   * error is any error that should be displayed in the UI.
   * If not set, nothing is shown.
   */
  @Input() error?: Alert;

  /**
   * notification is any notification that should be displayed in the UI.
   * If not set, nothing is shown.
   */
  @Input() notification?: Alert;

  /**
   * rawManifest is the current text in the editor after any change has been made to it.
   * It is raw in the sense that no modification has been made to it - it's exactly what the user has typed in.
   */
  rawManifest: string;

  /**
   * manifestTextCurrent is the current text after it has been modified by the manifestInterceptor.
   * This is not displayed in the text editor, but it is used to display in displaying the graph.
   */
  manifestTextCurrent: string;

  /**
   * manifestInterceptor is an observable that can be used to modify the manifest. It receives the
   * text that is currently in the editor and it is expected to return new text. This new text
   * will be used to display the graph.
   *
   * Default behavior is to return the input text.
   */
  @Input() manifestInterceptor: (manifest: string) => Observable<string> = (manifest => of(manifest));

  /**
   * manifestTextModified is emitted whenever the manifest text is modified in the text editor.
   * It sends the raw text that is currently in the editor.
   *
   * Note that this will fire before the manifestInterceptor is called and even if the manfiest interceptor
   * generates an error.
   */
  @Output() manifestTextModified = new EventEmitter<string>();

  /**
   * renderState determines if we are showing the graph preview or the parameters preview.
   * If 'dag', we are showing the graph preview.
   * If 'paramters', we are showing the parameters preview.
   */
  renderState: ManifestDagRenderState = 'dag';

  /**
   * errorMarkerId is a reference to an error marked in the text editor (AceEditor), used to clear the error.
   * It set, we are displaying an error in the editor.
   */
  errorMarkerId?: any;

  /**
   * parameters are the input parameters parsed from the manifest.
   */
  parameters = new Array<Parameter>();

  /**
   * state is the current state. It determines what to show.
   * * editor-and-dag: show the editor and dag graph
   * * editor-and-parameters: show the editor and the rendered parameters
   * * editor: show just the editor, full width.
   * * transitioning: helper state to indicate that the UI is changing.
   */
  state: ManifestDagEditorState = 'editor-and-dag';

  constructor() { }

  ngOnInit() {
    this.rawManifest = this.manifestText;
  }

  onManifestChange(newManifest: string, emitModified = true) {
    this.rawManifest = newManifest;

    if (emitModified) {
      this.manifestTextModified.emit(newManifest);
    }

    this.clearErrorMarker();
    try {
      // Make sure the yaml is valid
      yaml.safeLoad(newManifest);
    } catch (e) {
      if (e instanceof yaml.YAMLException) {
        const line = e.mark.line + 1;
        const column = e.mark.column + 1;

        const codeErrorRange = new aceRange(line - 1, 0, line - 1, column);
        this.errorMarkerId = this.aceEditor.getEditor().session.addMarker(codeErrorRange, 'highlight-error', 'fullLine');

        setTimeout(() => {
          this.error = {
            message: e.reason + ' at line: ' + line + ' column: ' + column,
            type: 'danger'
          };
        });
      }

      return;
    }

    if (!this.manifestInterceptor) {
      this.onManifestChangeFinalized(newManifest);
    } else {
      this.manifestInterceptor(newManifest)
          .subscribe(res => {
            this.onManifestChangeFinalized(res);
          }, (e: HttpErrorResponse) => {
            setTimeout(() => {
              let message = '';
              if (e.error.error) {
                message = e.error.error;
              } else if (e.error.message) {
                message = e.error.message;
              }

              this.error = {
                message,
                type: 'danger'
              };
            });
          });
    }
  }

  onManifestChangeFinalized(newManifest: string) {
    this.manifestTextCurrent = newManifest;
    if (newManifest === '') {
      this.dag.clear();
      return;
    }

    this.clearErrorMarker();

    try {
      const g = NodeRenderer.createGraphFromManifest(newManifest);
      this.dag.display(g);
      this.updateParameters(newManifest);
      setTimeout( () => {
        this.error = null;
      });
    } catch (e) {
      setTimeout(() => {
        // Based on the text, the graph may not be creatable. E.g. if you start typing: "abc..."
        // In this case, it's not clear what the error is, so we don't show it in UI.
        if (e.message === 'Could not generate graph. Provided Pipeline had no components.') {
          return;
        }

        this.error = {
          message: e.reason,
          type: 'danger'
        };
      });
    }
  }

  private clearErrorMarker() {
    if (this.errorMarkerId) {
      this.aceEditor.getEditor().session.removeMarker(this.errorMarkerId);
      this.errorMarkerId = undefined;
    }

    setTimeout(() => {
      this.error = null;
    });
  }

  private updateParameters(manifest: string) {
    const previousParameters = this.parameters;
    try {
      this.parameters = WorkflowExecuteDialogComponent.pluckParameters(manifest);
    } catch (e) {
      this.parameters = previousParameters;
    }
  }

  private updateState() {
    if (this.state === 'editor') {
      return;
    }

    if (this.renderState === 'dag') {
      this.state = 'editor-and-dag';
      return;
    }

    this.state = 'editor-and-parameters';
  }

  toggleFormRender() {
    if (this.renderState === 'dag') {
      this.renderState = 'parameters';
    } else {
      this.renderState = 'dag';
    }

    this.updateState();
  }

  toggleFullWidthEditor() {
    if (this.state !== 'editor') {
      this.state = 'editor';
      return;
    }

    this.state = 'transitioning';

    this.updateState();
  }
}
