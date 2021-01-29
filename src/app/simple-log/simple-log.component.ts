import { Component, EventEmitter, Input, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { AceEditorComponent } from 'ng2-ace-editor';
import { WorkflowService } from '../workflow/workflow.service';
import { strings } from '../../utility/strings';

@Component({
  selector: 'app-simple-log',
  templateUrl: './simple-log.component.html',
  styleUrls: ['./simple-log.component.scss']
})
export class SimpleLogComponent implements OnInit, OnDestroy {
  private socket: WebSocket;
  private biggestScrollDown = 0;
  private biggestScrollUp = 0;

  // tslint:disable-next-line:variable-name
  private _aceEditor;

  @ViewChild(AceEditorComponent, {static: false}) set aceEditor(aceEditor: AceEditorComponent) {
    this._aceEditor = aceEditor;

    if (aceEditor) {
      aceEditor.getEditor().session.on('changeScrollTop', (e) => {
        // Ignore scrolling above the scroll area.
        if (e < 0) {
          return;
        }

        if (this.lastScroll) {
          this.onScrollChange(e, this.lastScroll);
        }

        this.lastScroll = e;
      });
    }
  }

  get aceEditor(): AceEditorComponent {
    return this._aceEditor;
  }

  /**
   * socketUrl is a url that provides logs via websocket.
   */
  socketUrl: string;

  /**
   * Maximum number of lines to display in the log
   */
  @Input() maxLines = 30000;

  /**
   * How many lines we delete one the maxLines limit is reached.
   *
   * So if you have 100 max lines, and a linesChunkDelete of 10, once you hit 100 lines, the lines will be reduced to
   * 90, deleting from the front.
   */
  @Input() linesChunkDelete = 100;
  @Output() closeClicked = new EventEmitter();

  // The text displayed in the log.
  logText = '';

  // True if logs are loading data, false otherwise.
  loading = true;

  // The text displayed in the information section of the toolbar.
  information = '';

  // Last scroll position. Bookkeeping variable to track scroll amounts.
  lastScroll: number;

  // If true, the UI should scroll the user to the bottom as more log data is added.
  scrollToBottom = true;

  // Utility to determine if we can change the scrollToBottom value.
  canChangeScrollToBottom = true;

  // The number of lines of log text we have.
  private lines = 0;

  // The total number of lines we have had.
  private totalLines = 0;

  constructor() { }

  ngOnInit(): void {
  }

  clearLog() {
    this.logText = '';
    this.lines = 0;
    this.totalLines = 0;
    this.aceEditor.setText('');
    this.onLogsUpdated();
  }

  private appendTextToAceEditor(text: string) {
    const session = this.aceEditor.getEditor().session;
    session.insert({
      row: session.getLength(),
      column: 0
    }, text);
  }

  /**
   * Append text to the log.
   */
  writeLog(text: string) {
    if (this.lines > this.maxLines) {
      const indexCount = strings.findNthIndex(this.logText, '\n', this.linesChunkDelete);

      const index = indexCount.index;
      const count = indexCount.count;

      if (index > -1) {
        this.logText = this.logText.substr(index + 1);

        this.lines -= count;

        // keep track of the total lines, so the editor displays the correct line number
        this.aceEditor.setOptions({
          firstLineNumber: this.totalLines - this.lines + 1
        });

        this.aceEditor.setText(this.logText);
      }
    }

    this.appendTextToAceEditor(text);

    this.logText += text;

    // Weird, but fast?
    // https://stackoverflow.com/questions/881085/count-the-number-of-occurrences-of-a-character-in-a-string-in-javascript
    const newLineCount = (text.split('\n').length - 1);
    this.lines += newLineCount;
    this.totalLines += newLineCount;

    this.onLogsUpdated();
  }

  /**
   * Append text to the log, and then append a newline.
   */
  writeLogLn(text: string) {
    this.writeLog(text + '\n');
  }

  start(url: string) {
    this.socketUrl = url;
    // We're switching to a new node/logs provider.
    // Clean up the old subscription if there was one.
    if (this.socket) {
      this.socket.close();
    }

    // Clean up the log text as the new node/logs provider will have new logs.
    this.clearLog();

    this.loading = true;

    this.socket = new WebSocket(this.socketUrl);
    this.socket.onmessage = (event) => {
      try {
        const jsonData = JSON.parse(event.data);
        const logEntries = jsonData.result.logEntries;

        let bufferedString = '';
        for (let i = 0; i < logEntries.length; i++) {
          const logEntry = logEntries[i];

          if (logEntry.timestamp) {
            bufferedString += `${logEntry.timestamp} ${logEntry.content}`;
          } else {
            bufferedString += logEntry.content;
          }

          if (i < logEntries.length) {
            bufferedString += '\n';
          }
        }

        if (bufferedString !== '') {
          this.writeLog(bufferedString);
        }
      } catch (e) {
        console.error(e);
      }
    };

    this.socket.onclose = () => {
      this.loading = false;
    };
  }

  clear() {
    if (this.socket) {
      this.socket.close();
    }

    this.clearLog();
    this.socketUrl = undefined;
    this.loading = false;
    this.information = '';
  }

  ngOnDestroy(): void {
    if (this.socket) {
      this.socket.close();
    }
  }

  onCloseClick() {
    this.closeClicked.emit();
  }

  onScrollChange(newScrollPosition: number, oldScrollPosition: number) {
    const diff = newScrollPosition - oldScrollPosition;

    if (diff < this.biggestScrollUp) {
      this.biggestScrollUp = diff;
    }

    if (diff > this.biggestScrollDown) {
      this.biggestScrollDown = diff;
    }

    if (diff < 0 && diff < (this.biggestScrollUp  * 0.70)) {
      return;
    }

    if (diff > 0 && diff > (this.biggestScrollDown * 0.70)) {
      return;
    }

    // Ignore scrolling in 'place'
    if (diff !== 0) {
      const scrollingUp = diff < 0;

      // When we scroll up, stop the automatic scrolling to the bottom of the logs.
      if (scrollingUp) {
        if (this.canChangeScrollToBottom) {
          this.scrollToBottom = false;
        }
      } else { // Scrolling down
        const lastVisibleRow = this.aceEditor.getEditor().getLastVisibleRow();
        const totalRows = this.aceEditor.getEditor().session.getLength();
        const rowsFromBottom = totalRows - lastVisibleRow;

        if (rowsFromBottom < 10) {
          if (this.canChangeScrollToBottom) {
            this.scrollToBottom = true;
          }
          this.canChangeScrollToBottom = false;

          // This is to handle the case where the system is scrolling us automatically up to the last line
          // if we overscrolled.
          setTimeout(() => {
            this.canChangeScrollToBottom = true;
          }, 500);
        }
      }
    }
  }

  editorHasLessContentThanScreenAllows(): boolean {
    if (!this.aceEditor) {
      return false;
    }

    const editor = this.aceEditor.getEditor();

    const totalRows = editor.session.getLength();
    const lastVisibleRow = editor.getLastVisibleRow();

    return lastVisibleRow === totalRows;
  }

  onLogsUpdated() {
    this.scrollToBottomIfNeeded();
  }

  /**
   * Scrolls to the bottom of the logs content if
   * 1. There is more log content than visible.
   * 2. The scrollToBottom variable is true.
   */
  scrollToBottomIfNeeded() {
    if (!this.aceEditor) {
      return;
    }

    if (this.editorHasLessContentThanScreenAllows()) {
      return;
    }

    if (!this.scrollToBottom) {
      return;
    }

    const numberLines = this.aceEditor.getEditor().session.getDocument().getLength();

    this.aceEditor.getEditor().scrollToLine(numberLines, false, false);
  }

}
