import {PerspectiveCamera as ThreePerspectiveCamera} from 'three'
// import Motor from './Motor'
import {props} from './props'
import Node from './Node'
type XYZValuesObject<T> = import('./XYZValues').XYZValuesObject<T>
type Scene = typeof import('./Scene').default

// TODO: update this to have a CSS3D-perspective-like API like with the Scene's
// default camera.
export default class PerspectiveCamera extends Node {
    static defaultElementName = 'i-perspective-camera'

    // TODO remove attributeChangedCallback, replace with updated based on these props
    static props = {
        ...((Node as any).props || {}),
        fov: {...props.number, default: 75},
        aspect: {
            ...props.number,
            default(): any {
                return (this as any)._getDefaultAspect()
            },
            deserialize(val: any) {
                val == null
                    ? (this as any).constructor.props.aspect.default.call(this)
                    : (props as any).number.deserialize(val)
            },
        },
        near: {...props.number, default: 0.1},
        far: {...props.number, default: 1000},
        zoom: {...props.number, default: 1},
        active: {...props.boolean, default: false},
    }

    updated(oldProps: any, modifiedProps: any) {
        super.updated(oldProps, modifiedProps)

        if (!this.isConnected) return

        if (modifiedProps.active) {
            this.__setSceneCamera(this.active ? undefined : 'unset')
        }
        if (modifiedProps.aspect) {
            if (!this.aspect)
                // default aspect value based on the scene size.
                this.__startAutoAspect()
            else this.__stopAutoAspect()
        }
        // TODO handle the other props here, remove attributeChangedCallback
    }

    connectedCallback() {
        super.connectedCallback()

        this.__lastKnownScene = this.scene
    }

    // TODO, unmountedCallback functionality. issue #150
    unmountedCallback() {}

    attributeChangedCallback(attr: string, oldVal: string | null, newVal: string | null) {
        super.attributeChangedCallback(attr, oldVal, newVal)

        if (typeof newVal == 'string') {
            this.__attributeAddedOrChanged(attr, newVal)
        } else {
            this.__attributeRemoved(attr)
        }
    }

    protected _makeThreeObject3d() {
        return new ThreePerspectiveCamera(75, 16 / 9, 1, 1000)
    }

    // TODO replace with unmountedCallback #150
    protected _deinit() {
        super._deinit()

        // TODO we want to call this in the upcoming
        // unmountedCallback, but for now it's harmless but
        // will run unnecessary logic. #150
        this.__setSceneCamera('unset')
        this.__lastKnownScene = null
    }

    private __lastKnownScene: Scene | null = null

    // TODO CAMERA-DEFAULTS, get defaults from somewhere common.
    private __attributeRemoved(attr: string) {
        if (attr == 'fov') {
            this.three.fov = 75
            this.three.updateProjectionMatrix()
        } else if (attr == 'aspect') {
            this.__startAutoAspect()
            this.three.aspect = this.__getDefaultAspect()
            this.three.updateProjectionMatrix()
        } else if (attr == 'near') {
            this.three.near = 0.1
            this.three.updateProjectionMatrix()
        } else if (attr == 'far') {
            this.three.far = 1000
            this.three.updateProjectionMatrix()
        } else if (attr == 'zoom') {
            this.three.zoom = 1
            this.three.updateProjectionMatrix()
        } else if (attr == 'active') {
            this.__setSceneCamera('unset')
        }
    }

    private __attributeAddedOrChanged(attr: string, newVal: string) {
        if (attr == 'fov') {
            this.three.fov = parseFloat(newVal)
            this.three.updateProjectionMatrix()
        } else if (attr == 'aspect') {
            this.__stopAutoAspect()
            this.three.aspect = parseFloat(newVal)
            this.three.updateProjectionMatrix()
        } else if (attr == 'near') {
            this.three.near = parseFloat(newVal)
            this.three.updateProjectionMatrix()
        } else if (attr == 'far') {
            this.three.far = parseFloat(newVal)
            this.three.updateProjectionMatrix()
        } else if (attr == 'zoom') {
            this.three.zoom = parseFloat(newVal)
            this.three.updateProjectionMatrix()
        } else if (attr == 'active') {
            this.__setSceneCamera()
        }
    }

    private __startedAutoAspect = false

    private __startAutoAspect() {
        if (!this.__startedAutoAspect) {
            this.__startedAutoAspect = true
            this.scene.on('sizechange', this.__updateAspectOnSceneResize, this)
        }
    }
    private __stopAutoAspect() {
        if (this.__startedAutoAspect) {
            this.__startedAutoAspect = false
            this.scene.off('sizechange', this.__updateAspectOnSceneResize)
        }
    }

    private __updateAspectOnSceneResize({x, y}: XYZValuesObject<number>) {
        this.three.aspect = x / y
    }

    private __getDefaultAspect() {
        let result = 0

        if (this.scene) {
            result = this.scene.calculatedSize.x / this.scene.calculatedSize.y
        }

        // in case of a 0 or NaN (0 / 0 == NaN)
        if (!result) result = 16 / 9

        return result
    }

    private __setSceneCamera(unset?: 'unset') {
        if (unset) {
            // TODO: unset might be triggered before the scene was mounted, so
            // there might not be a last known scene. We won't need this check
            // when we add unmountedCallback. #150
            if (this.__lastKnownScene) (this.__lastKnownScene as any)._removeCamera(this)
        } else {
            if (!this.scene || !this.isConnected) return

            this.scene._addCamera(this)
        }
    }
}

export {PerspectiveCamera}
