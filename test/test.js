/**
 * @typedef {Object} QUnit
 * @property {function} module
 * @property {function} test
 */

/**
 * @typedef {Object} assert
 * @property {function} equal
 */

import {isTokenMovable, isUnsafePosition} from "../game-logic.js";

QUnit.module('game-logic', function () {
    QUnit.test('is token movable - home, less than 6', function (assert) {
        assert.equal(isTokenMovable(-1, 5), false);
    });

    QUnit.test('is unsafe position - 7', function (assert) {
        assert.equal(isUnsafePosition(7), true);
    });
});