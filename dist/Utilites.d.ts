export interface ICancelablePromise<T> {
    promise: Promise<T>;
    resolved: () => boolean;
    canceled: () => boolean;
    cancel: () => void;
}
declare const Utilities: {
    parseFunction: {
        suffix: string;
        parse: (data: any) => any;
        unparse: (data: any) => any;
    };
    cancelablePromise: <T>(promise: Promise<T>) => ICancelablePromise<T>;
    isDef: (object: any) => boolean;
    now: () => number;
    toDegrees: (radians: number) => number;
    toRadians: (degrees: number) => number;
    toArray: (t: number | Array<number>) => Array<number>;
    /**
     * Return number between {min} and {max}
     *
     * @param {number} min
     * @param {number} max
     * @param {number} value
     * @returns {number}
     */
    clamp: (min: number, max: number, value: number) => number;
    /**
     * Map number between {refMin} e {refMin} from {min} and  {max}
     *
     * @example
     * ```javascript
     * relativeClamp(0.5, 0, 1, 100, 200) // 150
     * ```
     *
     * @param {number} value
     * @param {number} refMin
     * @param {number} refMax
     * @param {number} toMin
     * @param {number} toMax
     * @returns {number}
     */
    relativeClamp: (value: number, refMin: number, refMax: number, toMin: number, toMax: number) => number;
};
export default Utilities;
//# sourceMappingURL=Utilites.d.ts.map