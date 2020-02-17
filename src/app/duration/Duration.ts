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
}
