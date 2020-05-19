import { WorkflowExecution } from "../../api";

export class WorkflowExecutionExtensions {
    public static activePhases = {
        'Pending': true,
        'Running': true
    }

    public static isActive(workflow: WorkflowExecution): boolean {
        return this.activePhases[workflow.phase];
    }
}
