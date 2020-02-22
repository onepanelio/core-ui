export class JSONUtils {
    public static fromJSON<T>(items: any[], transformer: (json: any) => T): T[] {
        if (!items) {
            return [];
        }

        const results: T[] = [];

        for (const item of items) {
            results.push(transformer(item));
        }

        return results;
    }
}
