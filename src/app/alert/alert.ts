export type AlertType = 'success' | 'warning' | 'danger' | 'info' | 'action';

export interface AlertInterface {
    title?: string;
    message?: string;
    type?: AlertType;
}

export class Alert {
    static fromJSON(json: any): Alert {
        let type = json.type || json._type;
        let title = json.title || json._title;
        let message = json.message || json._message;

        return new Alert({
            type: type,
            title: title,
            message: message
        });
    }

    title?: string;
    message?: string;
    type?: AlertType;

    constructor(data: AlertInterface) {
        if (data && !data.type) {
            data.type = 'success';
        }

        this.title = data.title;
        this.message = data.message;
        this.type = data.type;
    }
}
