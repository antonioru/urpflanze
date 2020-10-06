import SimplexNoise from 'simplex-noise';
import { ERepetitionType, IRepetition } from "./types/scene-child";
import Vec2, { TArray } from "./math/Vec2";
const noises = {
    random: new SimplexNoise(Math.random),
};
/**
 * Utilities function passed to <a href="[base_url]/ISceneChildPropArguments">ISceneChildPropArguments</a>
 *
 * @category Core.Utilities
 */
const Context = {
    /**
     * SimplexNoise <a href="https://www.npmjs.com/package/simplex-noise">url</a>
     * Return value between -1 and 1
     *
     * @param {string} [seed='random']
     * @param {number} [x=0]
     * @param {number} [y=0]
     * @param {number} [z=0]
     * @returns {number}
     */
    noise: (seed = 'random', x = 0, y = 0, z = 0) => {
        if (!noises[seed]) {
            noises[seed] = new SimplexNoise(seed);
        }
        return noises[seed].noise3D(x, y, z);
    },
    /**
     * Return angle (atan) from offset (or center) for matrix repetition.
     * Offset is array between [-1, -1] and [1, 1].
     * The return value is bettween -Math.PI / 2 and Math.PI / 2
     *
     * @param {IRepetition} repetition
     * @param {number | TArray} offsetFromCenter
     * @returns {number}
     */
    angle: (repetition, offsetFromCenter = [0, 0]) => {
        var _a;
        if (repetition.type == ERepetitionType.Matrix) {
            const matrixOffset = Vec2.create(offsetFromCenter);
            const center_matrix = Vec2.create((repetition.count_col - 1) / 2, (repetition.count_row - 1) / 2);
            center_matrix[0] += center_matrix[0] * matrixOffset[0];
            center_matrix[1] += center_matrix[1] * matrixOffset[1];
            const x = repetition.current_col - 1 - center_matrix[0];
            const y = repetition.current_row - 1 - center_matrix[1];
            return x === 0 ? 0 : Math.atan(y / x);
        }
        return (_a = repetition.current_angle) !== null && _a !== void 0 ? _a : 0;
    },
    /**
     * Return angle (atan2, 4 quadrants) from offset (or center) for matrix repetition.
     * Offset is array between [-1, -1] and [1, 1].
     * The return value is bettween -Math.PI an Math.PI
     *
     * @param {IRepetition} repetition
     * @param {number | TArray} offsetFromCenter
     * @returns {number}
     */
    angle2: (repetition, offsetFromCenter = [0, 0]) => {
        var _a;
        if (repetition.type == ERepetitionType.Matrix) {
            const matrixOffset = Vec2.create(offsetFromCenter);
            const center_matrix = Vec2.create((repetition.count_col - 1) / 2, (repetition.count_row - 1) / 2);
            center_matrix[0] += center_matrix[0] * matrixOffset[0];
            center_matrix[1] += center_matrix[1] * matrixOffset[1];
            const x = repetition.current_col - 1 - center_matrix[0];
            const y = repetition.current_row - 1 - center_matrix[1];
            return x === 0 ? 0 : Math.atan2(y, x);
        }
        return (_a = repetition.current_angle) !== null && _a !== void 0 ? _a : 0;
    },
    /**
     * Return distance from offset (or center) for matrix repetition.
     * The return value is between 0 and 1
     *
     * @param {IRepetition} repetition
     * @param {number | TArray} offsetFromCenter offset relative to distance prop
     * @returns {number}
     */
    distance: (repetition, offsetFromCenter = [0, 0]) => {
        if (repetition.type == ERepetitionType.Matrix) {
            const matrixOffset = Vec2.create(offsetFromCenter);
            const center_matrix = Vec2.create(0.5, 0.5);
            center_matrix[0] += center_matrix[0] * matrixOffset[0];
            center_matrix[1] += center_matrix[1] * matrixOffset[1];
            const current = Vec2.create(repetition.current_col_offset - 0.5 / repetition.count_col, repetition.current_row_offset - 0.5 / repetition.count_row);
            return Vec2.distance(current, center_matrix);
        }
        return 1;
    },
    /**
     * Get value percentage of scene width.
     *
     * @param {number} percentage
     * @param {SceneChild} sceneChild
     * @returns {number}
     * @example
     * ```javascript
     * const rect = new Urpflanze.Rect({
     * 	sideLength: ({ shape, context }) => context.percW(50, shape)
     * })
     * ```
     */
    percW: (percentage, sceneChild) => {
        return sceneChild && sceneChild.scene ? (sceneChild.scene.width * percentage) / 100 : percentage;
    },
    /**
     * Get value percentage of scene height.
     *
     * @param {number} percentage
     * @param {SceneChild} sceneChild
     * @returns {number}
     * @example
     * ```javascript
     * const rect = new Urpflanze.Rect({
     * 	sideLength: ({ shape, context }) => [context.percW(50, shape), context.percH(50, shape)]
     * })
     * ```
     */
    percH: (percentage, sceneChild) => {
        return sceneChild && sceneChild.scene ? (sceneChild.scene.height * percentage) / 100 : percentage;
    },
};
export default Context;
//# sourceMappingURL=Context.js.map