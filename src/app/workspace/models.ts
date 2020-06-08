export class WorkspacePermissions {
    public constructor(public canDelete: boolean, public canUpdate: boolean) {
    }

    public hasAnyActionPermissions() {
        return this.canDelete || this.canUpdate;
    }
}
