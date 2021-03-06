import 'element-behaviors'
import {MeshBasicMaterial} from 'three/src/materials/MeshBasicMaterial'
// import {multiple} from 'lowclass'
import BaseMaterialBehavior from './BaseMaterialBehavior'
import MaterialTexture from './MaterialTexture'

// export default class BasicMaterialBehavior extends multiple(BaseMaterialBehavior, MaterialTexture) {
export default class BasicMaterialBehavior extends MaterialTexture.mixin(BaseMaterialBehavior) {
	// constructor(el: Element) {
	//     super(el)
	// }
	protected _createComponent() {
		return new MeshBasicMaterial({color: 0x00ff00})
	}
}

elementBehaviors.define('basic-material', BasicMaterialBehavior)

export {BasicMaterialBehavior}
