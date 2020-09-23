import { WorkflowExecution } from "../../api";
import { ConfirmationDialogData } from "../confirmation-dialog/confirmation-dialog.component";

export class WorkflowExecutionExtensions {
    public static activePhases = {
        Pending: true,
        Running: true
    };

    public static isActive(workflow: WorkflowExecution): boolean {
        return this.activePhases[workflow.phase];
    }
}


export class WorkflowExecutionConstants {
    /**
     * Helper method so all terminate dialogs have the same message.
     */
    public static getConfirmTerminateDialogData(workflowName: string): ConfirmationDialogData {
        return {
            title: `Are you sure you want to terminate the workflow "${workflowName}"?`,
            confirmText: 'TERMINATE',
            type: 'delete',
        };
    }
}
