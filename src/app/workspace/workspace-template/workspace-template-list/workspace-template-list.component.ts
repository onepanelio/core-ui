import { Component, OnInit, ViewChild } from '@angular/core';
import {
    ListWorkspaceTemplatesResponse,
    WorkspaceServiceService,
    WorkspaceTemplate,
    WorkspaceTemplateServiceService
} from '../../../../api';
import { ActivatedRoute } from '@angular/router';
import { WorkspaceTemplateEditComponent } from '../workspace-template-edit/workspace-template-edit.component';
import { Alert } from '../../../alert/alert';
import { MatDialog } from '@angular/material/dialog';
import {
    WorkspaceExecuteDialogComponent,
    WorkspaceExecuteDialogResult
} from '../../workspace-execute-dialog/workspace-execute-dialog.component';
import { PageEvent } from '@angular/material/paginator';
import { AppRouter } from '../../../router/app-router.service';
import { AlertService } from '../../../alert/alert.service';
import { HttpErrorResponse } from '@angular/common/http';
import { WorkspaceTemplateCreateComponent } from '../workspace-template-create/workspace-template-create.component';
import {
    ConfirmationDialogComponent,
    ConfirmationDialogData
} from '../../../confirmation-dialog/confirmation-dialog.component';
import { CanComponentDeactivate } from '../../../guards/can-deactivate.guard';
import { Observable } from 'rxjs';
import { Pagination } from '../../../requests/pagination';

/**
 * WorkspaceTemplateState is a way to keep track of the current state of the component.
 * * create: we are creating a new workspace template
 * * edit: we are editing an existing workspace template
 * * view: we are viewing the workspace templates, but not creating or editing.
 */
type WorkspaceTemplateState = 'create' | 'edit' | 'view';

@Component({
    selector: 'app-workspace-template-list',
    templateUrl: './workspace-template-list.component.html',
    styleUrls: ['./workspace-template-list.component.scss']
})
export class WorkspaceTemplateListComponent implements OnInit, CanComponentDeactivate {
    @ViewChild(WorkspaceTemplateCreateComponent, {static: false}) workspaceTemplateCreateEditor: WorkspaceTemplateCreateComponent;
    @ViewChild(WorkspaceTemplateEditComponent, {static: false}) workspaceTemplateEditor: WorkspaceTemplateEditComponent;

    blankTemplate: WorkspaceTemplate = {
        name: 'Blank template',
        description: 'Start from a basic template that runs NGINX'
    };

    showWorkspaceTemplateEditor = true;

    namespace: string;
    pagination = new Pagination();
    workspaceTemplatesResponse: ListWorkspaceTemplatesResponse;
    workspaceTemplates: WorkspaceTemplate[] = [];

    /**
     * null means the selected template is the blank template.
     * undefined means no template is selected.
     * otherwise we do have a specific template selected.
     */
    selectedTemplate: WorkspaceTemplate | null | undefined = null;

    workspaceTemplateEditLoading = false;
    creatingWorkspaceTemplate = false;

    state: WorkspaceTemplateState = 'create';

    /**
     * terminatingTemplates keeps track of all of the workspace templates that are currently being
     * deleted.
     */
    deletingTemplates = new Map<string, WorkspaceTemplate>();

    constructor(
        private appRouter: AppRouter,
        private workspaceTemplateService: WorkspaceTemplateServiceService,
        private workspaceService: WorkspaceServiceService,
        private activatedRoute: ActivatedRoute,
        private dialog: MatDialog,
        private alertService: AlertService,
    ) {
    }

    ngOnInit() {
        this.activatedRoute.paramMap.subscribe(next => {
            this.namespace = next.get('namespace');

            this.getWorkspaceTemplates();
        });
    }

    canDeactivate(): Observable<boolean> | Promise<boolean> | boolean {
        const confirmData: ConfirmationDialogData = {
            title: 'You have unsaved changes',
            message: 'You have unsaved changes in your template, leaving will discard them.',
            confirmText: 'DISCARD CHANGES',
            type: 'confirm'
        };

        if (this.state === 'create' && this.workspaceTemplateCreateEditor.manifestChangedSinceSave) {
            const confirmDialog = this.dialog.open(ConfirmationDialogComponent, {
                data: confirmData
            });

            return confirmDialog.afterClosed();
        } else if (this.state === 'edit' && this.workspaceTemplateEditor.manifestChangedSinceSave) {


            const confirmDialog = this.dialog.open(ConfirmationDialogComponent, {
                data: confirmData
            });

            return confirmDialog.afterClosed();
        }

        return true;
    }

    private updateWorkspaceTemplateState() {
        if (this.showWorkspaceTemplateEditor && this.selectedTemplate === null) {
            this.state = 'create';
            return;
        }

        if (this.showWorkspaceTemplateEditor && this.selectedTemplate) {
            this.state = 'edit';
            return;
        }

        this.state = 'view';
    }

    private setWorkspaceTemplateEditorAlert(alert: Alert) {
        if (!this.workspaceTemplateEditor) {
            setTimeout(() => {
                this.setWorkspaceTemplateEditorAlert(alert);
            }, 250);

            return;
        }

        this.workspaceTemplateEditor.setAlert(alert);
    }

    getWorkspaceTemplates() {
        this.workspaceTemplateService.listWorkspaceTemplates(this.namespace, this.pagination.pageSize, this.pagination.page + 1)
            .subscribe(res => {
                this.workspaceTemplatesResponse = res;
                this.workspaceTemplates = res.workspaceTemplates;
            });
    }

    getWorkspaceTemplatesAndSelect(template: WorkspaceTemplate) {
        this.workspaceTemplateService.listWorkspaceTemplates(this.namespace, this.pagination.pageSize, this.pagination.page + 1)
            .subscribe(res => {
                this.workspaceTemplatesResponse = res;
                this.workspaceTemplates = res.workspaceTemplates;

                this.selectTemplate(template);

                this.setWorkspaceTemplateEditorAlert(new Alert({
                    message: `Created workspace template "${template.name}"`,
                }));
            });
    }

    newWorkspaceTemplate() {
        this.showWorkspaceTemplateEditor = true;
        this.selectedTemplate = null;

        this.updateWorkspaceTemplateState();
    }

    selectTemplate(template: WorkspaceTemplate) {
        this.showWorkspaceTemplateEditor = true;
        this.selectedTemplate = template;

        this.updateWorkspaceTemplateState();
    }

    cancelWorkspaceTemplate() {
        this.showWorkspaceTemplateEditor = false;
        this.selectedTemplate = null;

        this.updateWorkspaceTemplateState();
    }

    onCreate(template: WorkspaceTemplate) {
        this.creatingWorkspaceTemplate = true;
        this.workspaceTemplateService.createWorkspaceTemplate(this.namespace, template)
            .subscribe(res => {
                this.getWorkspaceTemplatesAndSelect(res);
                this.creatingWorkspaceTemplate = false;
            }, (err: HttpErrorResponse) => {
                this.creatingWorkspaceTemplate = false;

                if (err.status === 409) {
                    this.workspaceTemplateCreateEditor.setAlert(new Alert({
                        message: err.error.message,
                        type: 'danger',
                    }));
                } else {
                    this.workspaceTemplateCreateEditor.setAlert(new Alert({
                        title: 'Unable to create workspace template',
                        message: err.error.error,
                        type: 'danger',
                    }));
                }
            });
    }

    onEditUpdate(template: WorkspaceTemplate) {
        this.workspaceTemplateEditLoading = true;
        this.workspaceTemplateService.updateWorkspaceTemplate(this.namespace, template.uid, template)
            .subscribe(res => {
                this.selectedTemplate.description = template.description;
                this.workspaceTemplateEditor.getWorkspaceTemplateVersions();
                this.workspaceTemplateEditor.setAlert(new Alert({
                    type: 'success',
                    message: 'Template has been updated'
                }));
                this.workspaceTemplateEditLoading = false;
            }, (err: HttpErrorResponse) => {
                this.workspaceTemplateEditLoading = false;
                this.workspaceTemplateEditor.setAlert(new Alert({
                    type: 'danger',
                    title: 'Unable to update workspace template',
                    message: err.error.error
                }));
            });
    }

    createWorkspace(template: WorkspaceTemplate) {
        const dialogRef = this.dialog.open(WorkspaceExecuteDialogComponent, {
            width: '60vw',
            maxHeight: '100vh',
            data: {
                namespace: this.namespace,
                template,
            }
        });

        dialogRef.afterClosed().subscribe((result: WorkspaceExecuteDialogResult) => {
            if (!result || result === 'cancel') {
                return;
            }

            this.appRouter.navigateToWorkspaces(this.namespace);
        });
    }

    deleteWorkspaceTemplate(template: WorkspaceTemplate) {
        const data: ConfirmationDialogData = {
            title: `Are you sure you want to delete "${template.name}"?`,
            confirmText: 'DELETE',
            type: 'delete',
        };
        const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
            data
        });

        dialogRef.afterClosed().subscribe(res => {
            if (!res) {
                return;
            }

            this.deletingTemplates.set(template.uid, template);

            this.workspaceTemplateService.archiveWorkspaceTemplate(this.namespace, template.uid)
                .subscribe(() => {
                    this.deletingTemplates.delete(template.uid);
                    const templateIndex = this.workspaceTemplates.indexOf(template);
                    if (templateIndex > -1) {
                        this.workspaceTemplates.splice(templateIndex, 1);
                    }

                    this.getWorkspaceTemplates();
                    this.selectedTemplate = null;
                    this.state = 'create';
                }, (err: HttpErrorResponse) => {
                    this.deletingTemplates.delete(template.uid);
                    if (err.status === 400 && err.error.code === 9) {
                        this.alertService.storeAlert(new Alert({
                            message: 'Error deleting template ' + template.uid + ', it has running workspaces',
                            type: 'danger',
                        }));
                        return;
                    }

                    this.alertService.storeAlert(new Alert({
                        message: 'Error deleting template ' + template.uid,
                        type: 'danger',
                    }));
                });
        });
    }

    onPageChange(event: PageEvent) {
        this.pagination.page = event.pageIndex;
        this.pagination.pageSize = event.pageSize;

        this.showWorkspaceTemplateEditor = false;
        this.selectedTemplate = undefined;

        this.updateWorkspaceTemplateState();
        this.getWorkspaceTemplates();
    }
}
