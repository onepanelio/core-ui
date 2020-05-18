export class Duration {
    /**
     * Returns a string representing the duration between two dates in the format
     * mm:ss.
     *
     * Where mm = minutes with two digits.
     *       ss = seconds with two digits.
     *
     * If mm > 60, it will display as such, e.g. 130:56 -> 130 minutes, 56 seconds, or 2 hours 10 minutes, 56 seconds.
     *
     * Two digits will always be displayed, even if the minutes or seconds is less than 10 -> 05:03 -> 5 minutes, 3 seconds.
     *
     * If the finished Date is less than the started Date, null is returned.
     *
     * @param started
     * @param finished
     */
    static formatDuration(started: Date, finished: Date): string|null {
        const seconds = Math.floor((finished.getTime() - started.getTime()) / 1000.0);
        if(seconds < 0) {
            return null;
        }

        let minutes = Math.floor(seconds / 60).toFixed(0);

        if (minutes === '0') {
            minutes = '00';
        }

        let remainingSeconds: any = seconds % 60;
        if (remainingSeconds < 10) {
            remainingSeconds = '0' + remainingSeconds;
        }

        return `${minutes}:${remainingSeconds}`;
    }

    /**
     * Returns a string representing the duration between two dates in the format
     * mm:ss or hh:mm when minutes > 59.
     *
     * Where hh = hours with two digits
     *       mm = minutes with two digits.
     *       ss = seconds with two digits.
     *
     *
     * Two digits will always be displayed, even if the minutes or seconds is less than 10 -> 05:03 -> 5 minutes, 3 seconds.
     *
     * If the finished Date is less than the started Date, null is returned.
     *
     * @param started
     * @param finished
     */
    static formatDurationToHours(started: Date, finished: Date): string|null {
        const seconds = Math.floor((finished.getTime() - started.getTime()) / 1000.0);
        if(seconds < 0) {
            return null;
        }

        let minutes = Math.floor(seconds / 60) % 60;
        let hours = Math.floor(seconds / 3600);

        if(hours > 0) {
            let minutesString = `${minutes}`;
            if(minutes < 10) {
                minutesString = '0' + minutesString;
            }

            return `${hours.toFixed(0)}:${minutesString} hours`;
        }

        return Duration.formatDuration(started, finished) + ' min';
    }

    static formatDurationToDays(started: Date, finished: Date) {
        const seconds = Math.floor((finished.getTime() - started.getTime()) / 1000.0);
        if(seconds < 0) {
            return null;
        }

        let minutes = Math.floor(seconds / 60) % 60;
        let hours = Math.floor(seconds / 3600) % 60;
        let days = Math.floor(seconds / 86400);

        if(days > 0) {
            let word = 'day';
            if(days > 1) {
                word = 'days';
            }

            return `${days.toFixed(0)} ${word}`;
        }

        if(hours > 0) {
            let minutesString = `${minutes}`;
            if(minutes < 10) {
                minutesString = '0' + minutesString;
            }

            return `${hours.toFixed(0)}:${minutesString} hours`;
        }

        return Duration.formatDuration(started, finished) + ' min';
    }
}
