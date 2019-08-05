"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Behavior = exports.default = void 0;

require("element-behaviors");

var _WithUpdate = _interopRequireDefault(require("../WithUpdate"));

var _ForwardProps = _interopRequireDefault(require("./ForwardProps"));

var _Node = _interopRequireDefault(require("../../core/Node"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Base class for all behaviors
 *
 */
class Behavior extends _WithUpdate.default.mixin(_ForwardProps.default) {
  constructor(element) {
    super();
    this.element = element; // a promise resolved when an element is upgraded

    this.__whenDefined = null; // we need to wait for __elementDefined to be true because running the
    // superclass logic, otherwise `updated()` calls can happen before the
    // element is upgraded (i.e. before any APIs are available).

    this.__elementDefined = false;

    this.__checkElementIsLibraryElement(element);
  } // use a getter because Mesh is undefined at module evaluation time due
  // to a circular dependency.


  get requiredElementType() {
    return _Node.default;
  } // This could be useful, but at the moment it is only used by SkateJS in
  // triggerUpdate, expecting `this` to be a DOM node.


  get parentNode() {
    // seems to be a bug in the `get`ter, as this.element works fine in regular methods
    return this.element.parentNode;
  } // proxy setAttribute to this.element so that WithUpdate works in certain cases


  setAttribute(name, value) {
    this.element.setAttribute(name, value);
  } // We use __elementDefined in the following methods so we can delay prop
  // handling until the elements are upgraded and their APIs exist.
  //
  // NOTE, another way we could've achieved this is to let elements emit an
  // event in connectedCallback, at which point the element is guaranteed to
  // be upgraded. We currently do emit the GL_LOAD event. Which can only
  // happen when the element is upgrade AND has loaded GL objects (and these
  // behaviors only care about GL obbjects at the moment) so it'd be possible
  // to rely only on that event for the GL behaviors (which they all currently
  // are). If we have behaviors that work with CSS, not GL, then we could rely
  // on the CSS_LOAD event. In any case, the current solution is more generic,
  // for use with any type of custom elements.


  async attributeChangedCallback(name, oldValue, newValue) {
    if (!this.__elementDefined) await this.__whenDefined;
    super.attributeChangedCallback(name, oldValue, newValue);
  }

  async connectedCallback() {
    if (!this.__elementDefined) await this.__whenDefined;
    super.connectedCallback();

    this._listenToElement();
  }

  async disconnectedCallback() {
    if (!this.__elementDefined) await this.__whenDefined;
    super.disconnectedCallback();

    this._unlistenToElement();
  } // used by ForwardProps. See ForwardProps.js


  get _observedObject() {
    return this.element;
  }

  _listenToElement() {// subclasses: add event listeners
  }

  _unlistenToElement() {} // subclasses: remove event listeners
  // TODO add a test to make sure this check works


  async __checkElementIsLibraryElement(element) {
    const BaseClass = this.requiredElementType;

    if (element.nodeName.includes('-')) {
      this.__whenDefined = customElements.whenDefined(element.nodeName.toLowerCase()); // We use `.then` here on purpose, so that setting
      // __elementDefined happens in the very first microtask after
      // __whenDefined is resolved. Otherwise if we set
      // __elementDefined after awaiting the following Promise.race,
      // then it will happen on the second microtask after
      // __whenDefined is resolved. Our goal is to have APIs ready as
      // soon as possible in the methods above that wait for
      // __whenDefined.

      this.__whenDefined.then(() => {
        this.__elementDefined = element instanceof BaseClass;
      });

      await Promise.race([this.__whenDefined, new Promise(r => setTimeout(r, 1000))]);
      if (!this.__elementDefined) throw new Error(`
                    Either the element you're using the behavior on is not an
                    instance of ${BaseClass.name}, or there was a 1-second
                    timeout waiting for the element to be defined. Please make
                    sure all elements you intend to use are defined.
                `);
    } else {
      throw new Error(`
                    The element you're using the mesh behavior on (<${element.tagName.toLowerCase()}>)
                    is not an instance of ${BaseClass.name}.
                `);
    }
  }

}

exports.Behavior = exports.default = Behavior;