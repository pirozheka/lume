import {Eventful} from '@lume/eventful'
import {reactive} from '@lume/element'
import r from 'regexr'

export type XYZValuesArray<T> = [T, T, T]
export type XYZPartialValuesArray<T> = [T] | [T, T] | [T, T, T] // Is there a better way to make a tuplet from 1 to 3 items?
export type XYZValuesObject<T> = {x: T; y: T; z: T}
export type XYZPartialValuesObject<T> = Partial<XYZValuesObject<T>>
export type XYZValuesParameters<T> = /*XYZValues | */ XYZPartialValuesArray<T> | XYZPartialValuesObject<T> | string | T

const defaultValues: XYZValuesObject<any> = {x: undefined, y: undefined, z: undefined}

/**
 * Represents a set of values for the X, Y, and Z axes. For example, the
 * position of an object can be described using a set of 3 numbers, one for each
 * axis in 3D space: {x:10, y:10, z:10}.
 *
 * The values don't have to be numerical. For example,
 * {x:'foo', y:'bar', z:'baz'}
 */
@reactive
export default abstract class XYZValues<T = any> extends Eventful {
	private __x: T = undefined!
	private __y: T = undefined!
	private __z: T = undefined!

	constructor(x?: XYZValuesParameters<T>, y?: T, z?: T) {
		super()
		this.__from(x, y, z)
	}

	protected abstract get default(): XYZValuesObject<T>

	private get _default(): XYZValuesObject<T> {
		return this.default || defaultValues
	}

	private __from(x?: XYZValuesParameters<T>, y?: T, z?: T): this {
		if (x === undefined && y === undefined && z === undefined) {
			this.fromDefault()
		} else if (Array.isArray(x)) {
			this.fromArray(x)
		} else if (typeof x === 'object' && x !== null) {
			if (x === this) return this
			this.fromObject(x as XYZValuesObject<T>)
		} else if (typeof x === 'string' && y === undefined && z === undefined) {
			this.fromString(x)
		} else this.set(x as any, y as any, z as any)

		return this
	}

	from(x: XYZValuesParameters<T>, y?: T, z?: T): this {
		return this.__from(x, y, z)
	}

	set(x: T, y: T, z: T): this {
		this.x = x
		this.y = y
		this.z = z

		return this
	}

	fromArray(array: XYZPartialValuesArray<T>): this {
		this.set(array[0] as any, array[1] as any, array[2] as any)
		return this
	}

	toArray(): XYZValuesArray<T> {
		return [this.x, this.y, this.z]
	}

	fromObject(object: XYZPartialValuesObject<T>): this {
		this.set(object.x as any, object.y as any, object.z as any)
		return this
	}

	toObject(): XYZValuesObject<T> {
		return {x: this.x, y: this.y, z: this.z}
	}

	fromString(string: string, separator: string = ''): this {
		this.fromArray(this.stringToArray(string, separator))
		return this
	}

	toString(separator: string = ''): string {
		if (separator) {
			return `${this.x}${separator} ${this.y}${separator} ${this.z}`
		} else {
			return `${this.x} ${this.y} ${this.z}`
		}
	}

	/**
	 * Defines how to deserialize an incoming string being set onto one of the
	 * x, y, or z properties. Subclasses should override this.
	 * @param _prop The property name (x, y, or z)
	 * @param value The value to be deserialized
	 */
	deserializeValue(_prop: string, value: string): T {
		return (value as unknown) as T
	}

	// XXX This grows but never shrinks. Can we make the cache collectable? Maybe we
	// need to use WeakRef along with a list of XYZValues instances.
	private static __stringArrayRegexCache: {[k: string]: RegExp} = {}

	stringToArray(string: string, separator: string = ','): XYZPartialValuesArray<T> {
		separator = separator || ',' // prevent empty string
		let re = (this.constructor as typeof XYZValues).__stringArrayRegexCache[separator]
		if (!re) {
			re = r`/(?:\s*${r.escape(separator)}\s*)|(?:\s+)/g`
			;(this.constructor as typeof XYZValues).__stringArrayRegexCache[separator] = re
		}
		const values = string.trim().split(re)
		const result = ([] as unknown) as XYZPartialValuesArray<T>
		const length = values.length
		if (length > 0) result[0] = this.deserializeValue('x', values[0])
		if (length > 1) result[1] = this.deserializeValue('y', values[1])
		if (length > 2) result[2] = this.deserializeValue('z', values[2])
		return result
	}

	fromDefault(): this {
		this.set(this._default.x as any, this._default.y as any, this._default.z as any)
		return this
	}

	/**
	 * Subclasses extend this to implement type checks. Return true if the
	 * value should be assigned, false otherwise. A subclass could also throw
	 * an error when receiving an unexpected values.
	 *
	 * Returning false, for example, can allow 'undefined' values to be
	 * ignored. So we can for example do things like `v.fromObject({z: 123})` to
	 * set only z and ignore x and y.
	 *
	 * @param prop
	 * @param value
	 */
	protected checkValue(_prop: string, _value: T): boolean {
		return true
	}

	@reactive
	set x(value: T) {
		if (!this.checkValue('x', value)) return
		this.__x = value
		this.emit('valuechanged', 'x')
	}

	get x(): T {
		return this.__x
	}

	@reactive
	set y(value: T) {
		if (!this.checkValue('y', value)) return
		this.__y = value
		this.emit('valuechanged', 'y')
	}

	get y(): T {
		return this.__y
	}

	@reactive
	set z(value: T) {
		if (!this.checkValue('z', value)) return
		this.__z = value
		this.emit('valuechanged', 'z')
	}

	get z(): T {
		return this.__z
	}
}

export {XYZValues}
