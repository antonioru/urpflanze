import SimplexNoise from 'simplex-noise'
import Vec2, { TArray } from '@core/math/Vec2'
import ShapeBase from '@core/shapes/ShapeBase'
import { Repetition, RepetitionType } from '@core/types/ShapeBase'

const noises: {
	[key: string]: SimplexNoise
} = {
	random: new SimplexNoise(Math.random),
}

/**
 * SimplexNoise
 *
 * @param {string} [seed='random']
 * @param {number} [x=0]
 * @param {number} [y=0]
 * @param {number} [z=0]
 * @returns {number}
 */
function noise(seed: string = 'random', x = 0, y = 0, z = 0): number {
	if (!noises[seed]) {
		noises[seed] = new SimplexNoise(seed)
	}

	return noises[seed].noise3D(x, y, z)
}

/**
 * Return angle from offset(or center)
 *
 * @param {Repetition} repetition
 * @param {number | TArray} offsetFromCenter
 * @returns {number}
 */
function angle(repetition: Repetition, offsetFromCenter: number | TArray = [0, 0]): number {
	if (repetition.type == RepetitionType.Matrix) {
		const matrixOffset = Vec2.create(offsetFromCenter)
		const center_matrix = Vec2.create(
			((repetition.count_col as number) - 1) / 2,
			((repetition.count_row as number) - 1) / 2
		)

		center_matrix[0] += center_matrix[0] * matrixOffset[0]
		center_matrix[1] += center_matrix[1] * matrixOffset[1]

		return Math.atan(
			((repetition.current_row as number) - 1 - center_matrix[1]) /
				((repetition.current_col as number) - 1 - center_matrix[0])
		)
	}

	return repetition.current_angle ?? 0
}

/**
 * Return distance from offset (or center)
 *
 * @param {Repetition} repetition
 * @param {number | TArray} offsetFromCenter offset relative to distance prop
 * @param {number | TArray} scaleDistance divide result by scaleDistance
 * @returns {number}
 */
function distance(
	repetition: Repetition,
	offsetFromCenter: number | TArray = [0, 0],
	scaleDistance: number | TArray = [1, 1]
): number {
	if (repetition.type == RepetitionType.Matrix) {
		const matrixOffset = Vec2.create(offsetFromCenter)
		const scale = Vec2.create(scaleDistance)

		const center_matrix = Vec2.create(
			((repetition.count_col as number) - 1) / 2,
			((repetition.count_row as number) - 1) / 2
		)

		center_matrix[0] += center_matrix[0] * matrixOffset[0]
		center_matrix[1] += center_matrix[1] * matrixOffset[1]

		const current = Vec2.create(repetition.current_col - 1, repetition.current_row - 1)

		Vec2.divide(current, scale)

		return Vec2.distance(current, center_matrix)
	}

	return 1
}

/**
 * Get value percentage of scene width
 *
 * @param {number} percentage
 * @param {ShapeBase} shape
 * @returns {number}
 */
function percW(percentage: number, shape: ShapeBase): number {
	return shape && shape.scene ? (shape.scene.width * percentage) / 100 : percentage
}

/**
 * Get value percentage of scene height
 *
 * @param {number} percentage
 * @param {ShapeBase} shape
 * @returns {number}
 */
function percH(percentage: number, shape: ShapeBase): number {
	return shape && shape.scene ? (shape.scene.height * percentage) / 100 : percentage
}

export default {
	noise,
	angle,
	distance,
	percW,
	percH,
}
