import { Workspace } from '../../api';

export class WorkspaceUtils {
    static getParameterValue(workspace: Workspace, key: string): string {
        for (const param of workspace.parameters) {
            if (param.name === key) {
                return param.value;
            }
        }

        return null;
    }

    static setParameter(workspace: Workspace, key: string, value: string) {
        for (const param of workspace.parameters) {
            if (param.name === key) {
                param.value = value;
            }
        }
    }
}
