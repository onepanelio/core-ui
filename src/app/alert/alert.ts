export type AlertType = 'success' | 'warning' | 'danger' | 'info' | 'action';

export interface AlertInterface {
    title?: string;
    message?: string;
    type?: AlertType;
}

export class Alert {
    constructor(data: AlertInterface) {
        if (data && !data.type) {
            data.type = 'success';
        }

        this.title = data.title;
        this.message = data.message;
        this.type = data.type;
    }

    title?: string;
    message?: string;
    type?: AlertType;
    static fromJSON(json: any): Alert {
        const type = json.type || json._type;
        const title = json.title || json._title;
        const message = json.message || json._message;

        return new Alert({
            type,
            title,
            message
        });
    }
}
