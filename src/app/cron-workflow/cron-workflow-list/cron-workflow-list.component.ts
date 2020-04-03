import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { MatSnackBar, MatSnackBarRef, SimpleSnackBar } from "@angular/material/snack-bar";
import { ActivatedRoute, Router } from "@angular/router";
import {
  CronWorkflow,
  CronWorkflowServiceService,
  WorkflowExecution,
  WorkflowServiceService,
  WorkflowTemplate
} from "../../../api";
import { MatDialog, MatDialogRef } from "@angular/material/dialog";
import {
  CronWorkflowEditData,
  CronWorkflowEditDialogComponent
} from "../cron-workflow-edit-dialog/cron-workflow-edit-dialog.component";
import { WorkflowTemplateDetail } from "../../workflow-template/workflow-template.service";
import { WorkflowExecuteDialogComponent } from "../../workflow/workflow-execute-dialog/workflow-execute-dialog.component";

@Component({
  selector: 'app-cron-workflow-list',
  templateUrl: './cron-workflow-list.component.html',
  styleUrls: ['./cron-workflow-list.component.scss']
})
export class CronWorkflowListComponent implements OnInit {
  private snackbarRef: MatSnackBarRef<SimpleSnackBar>;

  displayedColumns = ['name','schedule', 'spacer', 'actions'];

  @Input() namespace: string;
  @Input() cronWorkflows: CronWorkflow[] = [];
  @Input() template: WorkflowTemplate|WorkflowTemplateDetail;

  // This is fired whenever we add or remove a row from the list.
  @Output() listRowsModified = new EventEmitter();

  dialogRef: MatDialogRef<CronWorkflowEditDialogComponent>;

  constructor(
      private activatedRoute: ActivatedRoute,
      private cronWorkflowServiceService: CronWorkflowServiceService,
      private workflowServiceService: WorkflowServiceService,
      private dialog: MatDialog,
      private snackbar: MatSnackBar,
      private router: Router) { }

  ngOnInit(): void {

  }

  ngOnDestroy(): void {
    if (this.snackbarRef) {
      this.snackbarRef.dismiss();
    }
  }

  onEdit(workflow: CronWorkflow) {
    const data: CronWorkflowEditData = {
      cronWorkflow: workflow,
      manifest: this.template.manifest
    };

    this.dialogRef = this.dialog.open(CronWorkflowEditDialogComponent, {
      width: '60vw',
      maxHeight: '100vh',
      data: data,
    });

    this.dialogRef.afterClosed().subscribe(res => {
      if(!res) {
        return;
      }

      let updatedData: CronWorkflow = {
        ...res.cron,
        workflowExecution: res.workflowExecution
      };
      updatedData.workflowExecution.workflowTemplate = this.template;

      //TODO update labels

      this.cronWorkflowServiceService.updateCronWorkflow(this.namespace, workflow.name, updatedData)
          .subscribe(res => {
            for(let key in res) {
              workflow[key] = res[key];
            }
          }, err => {
            // Do nothing
          })
    })
  }

  onExecute(workflow: CronWorkflow) {
    let data: WorkflowExecution = {
      workflowTemplate: this.template,
    };

    if (workflow.workflowExecution) {
      data.parameters = workflow.workflowExecution.parameters;
    } else {
      data.parameters = WorkflowExecuteDialogComponent.pluckParameters(this.template.manifest);
    }

    if (!data.parameters) {
      data.parameters = [];
    }

    this.workflowServiceService.createWorkflowExecution(this.namespace, data)
        .subscribe(res => {
          this.router.navigate(['/', this.namespace, 'workflows', res.name]);
        });
  }


  onDelete(workflow: CronWorkflow) {
    this.cronWorkflowServiceService.terminateCronWorkflow(this.namespace, workflow.name)
        .subscribe(res => {
          this.listRowsModified.emit();
          this.snackbarRef = this.snackbar.open('Cron-Workflow terminated', 'OK');
        }, err => {
          this.snackbarRef = this.snackbar.open('Unable to stop workflow', 'OK');
        })
    ;
  }
}
