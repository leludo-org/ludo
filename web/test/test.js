/**
 * @typedef {Object} QUnit
 * @property {function} module
 * @property {function} test
 */

/**
 * @typedef {Object} assert
 * @property {function} equal
 * @property {function} deepEqual
 */

import {isTokenMovable, isSafePosition, findCapturedOpponents} from "../scripts/index.js/game-logic.js";

QUnit.module('game-logic', function () {
    QUnit.test('is token movable - home, less than 6', function (assert) {
        assert.equal(isTokenMovable(-1, 5), false);
    });

    QUnit.test('is safe position - 7', function (assert) {
        assert.equal(isSafePosition(8), true);
    });


    // QUnit.test('no self capture', function (assert) {
    //     const actualResult = findCapturedOpponents(2, 9, [[-1,-1,-1,-1],[-1,-1,-1,-1],[5,-1,-1,-1],[-1,-1,-1,-1]]);
    //     const expectedResult = [[],[],[],[]];
    //     assert.deepEqual(actualResult, expectedResult);
    // });
});