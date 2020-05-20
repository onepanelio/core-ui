export class strings {
    /**
     * Finds the Nth index of a substring in a string and the how many times it was found, up to that point.
     *
     * returns {
     *     index: Nth index or last index found,
     *     count: number of occurences found
     * }
     *
     * If not found, returns -1 and 0.
     * If n is after the nth one, returns the last index.
     *
     * For the string "a walking cat",
     *
     * findNthIndex("...", "a", 0) returns -1, 0
     * findNthIndex("...", "a", 1) returns 0, 1
     * findNthIndex("...", "a", 2) returns 3, 2
     * findNthIndex("...", "a", 3) returns 11, 3
     * findNthIndex("...", "a", 10) returns 11, 3
     *
     * @param source
     * @param substring
     * @param n
     */
    public static findNthIndex(source: string, substring: string, n: number = 0): { index: number, count: number } {
        let result = -1;
        let count = 0;

        for(let i = 0; i < n; i++) {
            const newResult = source.indexOf(substring, result + 1);

            if(newResult < 0) {
                break;
            }

            count++;
            result = newResult;
        }

        return {
            index: result,
            count: count
        }
    }
}
