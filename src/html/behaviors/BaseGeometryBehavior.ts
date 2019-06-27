import BaseMeshBehavior from './BaseMeshBehavior'
import {props, changePropContext} from '../../core/props'
import XYZNonNegativeValues from '../../core/XYZNonNegativeValues'

// base class for geometry behaviors
export default class BaseGeometryBehavior extends BaseMeshBehavior {
    static type = 'geometry'

    static props = {
        // if we have no props defined here, WithUpdate breaks
        size: changePropContext(props.XYZNonNegativeValues, (self: any) => self.element),
        sizeMode: changePropContext(props.XYZSizeModeValues, (self: any) => self.element),
    }

    // TODO no any
    element: any

    updated(_oldProps: any, modifiedProps: any) {
        const {size, sizeMode} = modifiedProps

        if (size || sizeMode) {
            this.__updateGeometryOnSizeChange(this.size)
        }
    }

    protected _listenToElement() {
        super._listenToElement()

        // TODO the following three events can be replaced with a single propchange:size event
        this.element.on('sizechange', this.__onSizeValueChanged, this)
        this.element.size.on('valuechanged', this.__onSizeValueChanged, this)
        this.element.sizeMode.on('valuechanged', this.__onSizeValueChanged, this)
    }

    protected _unlistenToElement() {
        super._unlistenToElement()

        this.element.off('sizechange', this.__onSizeValueChanged)
        this.element.size.off('valuechanged', this.__onSizeValueChanged)
        this.element.sizeMode.off('valuechanged', this.__onSizeValueChanged)
    }

    private __onSizeValueChanged() {
        // tells WithUpdate (from BaseMeshBehavior) which prop
        // changed and makes it finally trigger our updated method
        // this.size = this.size
        this.triggerUpdateForProp('size')
    }

    // NOTE we may use the x, y, z args to calculate scale when/if we
    // implement size under the hood as an Object3D.scale.
    private __updateGeometryOnSizeChange(_size: XYZNonNegativeValues) {
        // TODO PERFORMANCE, resetMeshComponent creates a new geometry.
        // Re-creating geometries is wasteful, re-use them when possible, and
        // add instancing. Maybe we use Object3D.scale as an implementation
        // detail of our `size` prop.
        this.resetMeshComponent()
    }
}

export {BaseGeometryBehavior}
