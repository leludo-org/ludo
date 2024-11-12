/**
 * @typedef {Object} QUnit
 * @property {function} module
 * @property {function} test
 */

/**
 * @typedef {Object} assert
 * @property {function} equal
 */

import {isTokenMovable} from "../game-logic.js";

QUnit.module('game-logic', function () {
    QUnit.test('is token movable - home, less than 6', function (assert) {
        assert.equal(isTokenMovable(-1, 5), false);
    });
});