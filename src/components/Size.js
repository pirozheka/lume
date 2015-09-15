import Component from './Component';
import Vec3 from '../util/Vec3';
import trash from '../util/Trash';
import Pool from '../util/Pool';
import Event from '../util/Event';

Event.register('SIZE_CHANGE');

class Size extends Component {

  init(options) {
    super.init(options);

    this._sizeMode = options && options.sizeMode || Vec3(
      Size.ABSOLUTE_SIZE,
      Size.ABSOLUTE_SIZE,
      Size.ABSOLUTE_SIZE
    );

    this._absoluteSize = options && options.absoluteSize || Vec3(0, 0, 0);

    // The actual, computed, current size.
    this._size = Vec3();
  }

  update() {
    var changed = false;

    for (var i=0; i < this._size.length; i++) {

      switch(this._sizeMode[i]) {

        case Size.ABSOLUTE_SIZE:
          if (this._size[i] !== this._absoluteSize[i]) {
            this._size[i] = this._absoluteSize[i];
            changed = true;
          }
          break;

      }

      // console.log(i, this._sizeMode[i], this._absoluteSize[i], this._size[i]);
    }

    if (changed)
      this.emit(Event.SIZE_CHANGE);

    // Must be last; sets _updateRequested=false
    super.update();
  }

  recycle() {
    this._sizeMode.recycle();
    this._absoluteSize.recycle();
    this._size.recycle();
    super.recycle();
  }

  /* CustomComponent specific methods */

  setSizeMode(vec3orX, y, z) {
    if (y) {

      for (var i=0; i < arguments.length; i++) {
        if (arguments[i] !== this._sizeMode[i]) {
          this._sizeMode[i] = arguments[i];
          this.requestUpdate();
        }
      }

    } else {

      if (this._sizeMode.equals(vec3orX)) {
        vec3orX.recycle();
      } else {
        this._sizeMode.recycle();
        this._sizeMode = vec3orX;
        this.requestUpdate();
      }

    }
  }

  setAbsolute(newSizeVec3orX, y, z) {
    if (y) {

      for (var i=0; i < arguments.length; i++) {
        if (arguments[i] !== this._absoluteSize[i]) {
          this._absoluteSize[i] = arguments[i];
          this.requestUpdate();
        }
      }

    } else {

      if (this._absoluteSize.equal(newSizeVec3orX)) {
        newSizeVec3orX.recycle();
      } else {
        this._absoluteSize.recycle();
        this._absoluteSize = newSizeVec3orX;
        this.requestUpdate();
      }
      
    }
  }

}

Component.configure('size', Size);

Size.ABSOLUTE_SIZE = 1;
Size.RELATIVE_SIZE = 2;
Size.RENDER_SIZE = 3;

export default Size;