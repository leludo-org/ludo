/**
 * @typedef {Object} QUnit
 * @property {function} module
 * @property {function} test
 */

/**
 * @typedef {Object} assert
 * @property {function} equal
 */


QUnit.module('add', function () {
    QUnit.test('two numbers', function (assert) {
        assert.equal(1,1);
    });
});