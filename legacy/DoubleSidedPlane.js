"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = exports.DoubleSidedPlane = void 0;

var _Transform = _interopRequireDefault(require("famous/src/core/Transform"));

var _Molecule = _interopRequireDefault(require("./Molecule"));

var _Plane = _interopRequireDefault(require("./Plane"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/*
 * LICENSE
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 *
 */

/**
 * A scenegraph tree who's two leaf nodes are [Plane](#Plane) instances facing
 * opposite directions. For the purposes of these docs, in a brand new app with
 * only a single `DoubleSidedPlane` added to the context, and having no
 * rotation, "plane1" faces you and "plane2" faces away.
 *
 * @class DoubleSidedPlane
 * @extends Molecule
 */
class DoubleSidedPlane extends _Molecule.default {
  /**
   * Creates a new `DoubleSidedPlane` who's `initialOptions` get passed to
   * both [Plane](#Plane) instances, as well as this DoubleSidedPlane's parent
   * [Molecule](#Molecule) constructor.
   *
   * @constructor
   * @param {Object} initialOptions The options to initiate the `DoubleSidedPlane` with.
   */
  constructor(initialOptions) {
    super(initialOptions);
    this.children = [];
    this.plane1 = new _Plane.default(this.options);
    this.plane1.transform.set(_Transform.default.rotate(0, 0, 0));
    this.setOptions({
      properties: {
        background: 'orange'
      }
    });
    this.plane2 = new _Plane.default(this.options);
    this.plane2.transform.set(_Transform.default.rotate(0, Math.PI, 0));
    this.children.push(this.plane1);
    this.children.push(this.plane2);
    this.add(this.plane2);
    this.add(this.plane1);
    this.plane1.pipe(this.options.handler);
    this.plane2.pipe(this.options.handler);
  }
  /**
   * Get the content of the [famous/src/core/Surface](#famous/src/core/Surface) of each [Plane](#Plane).
   *
   * @returns {Array} An array containing two items, the content of each
   * `Plane`. The first item is from "plane1".
   */


  getContent() {
    return [this.plane1.getContent(), this.plane2.getContent()];
  }
  /**
   * Set the content of both [Plane](#Plane) instances.
   *
   * @param {Array} content An array of content, one item per `Plane`. The
   * first item is for "plane1".
   */


  setContent(content) {
    this.plane1.setContent(content[0]);
    this.plane2.setContent(content[1]);
  }

}

exports.DoubleSidedPlane = DoubleSidedPlane;
var _default = DoubleSidedPlane;
exports.default = _default;