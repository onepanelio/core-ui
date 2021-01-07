export interface AvailablePermissions {
    create?: boolean;
    get?: boolean;
    watch?: boolean;
    list?: boolean;
    delete?: boolean;
    update?: boolean;
}

export class Permissions {
    create?: boolean;
    get?: boolean;
    watch?: boolean;
    list?: boolean;
    delete?: boolean;
    update?: boolean;

    public constructor(permissions: AvailablePermissions = {}) {
        this.create = permissions.create;
        this.get = permissions.get;
        this.watch = permissions.watch;
        this.list = permissions.list;
        this.delete = permissions.delete;
        this.update = permissions.update;
    }

    public hasAnyActionPermissions() {
        return this.delete || this.update;
    }
}
