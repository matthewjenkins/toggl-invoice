export interface IGroup<TKey, TValue> {
    key: TKey;
    values: TValue[];
}
export class Utils {

    public static groupBy<TKey, TValue>(array: TValue[], keyFn: (t: TValue) => TKey): IGroup<TKey, TValue>[] {
        const result: IGroup<TKey, TValue>[] = [];
        const map: Map<TKey, IGroup<TKey, TValue>> = new Map<TKey, IGroup<TKey, TValue>>();
        array.forEach(t => {
            const k: any = keyFn(t);
            if (map.has(k))
                map.get(k).values.push(t);
            else {
                const g: any = {
                    key: k,
                    values: [t]
                };
                map.set(k, g);
                result.push(g);
            }
        });
        return result;
    }

    public static distinct<T>(array: T[]): T[] {
        return array.filter((value, index, s) => s.indexOf(value) === index);
    }

    public static pad(val: string, width: number, prefix?: string): string {
        prefix = prefix || "0";
        val = val + "";
        return val.length >= width ? val : new Array(width - val.length + 1).join(prefix) + val;
    }

    public static ellipsis(val: string, width: number, ellipsis: string = "..."): string {
        if (val.length <= width)
            return val;

        return val.slice(0, width - ellipsis.length) + ellipsis;
    }
}
