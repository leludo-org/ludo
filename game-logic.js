/**
 *
 * @param {number} tokenPosition
 * @param {number} diceRoll
 * @return {boolean}
 */
export function isTokenMovable(tokenPosition, diceRoll) {
    if (diceRoll === 6 && tokenPosition === -1) {
        return true
    }

    return tokenPosition >= 0 && (tokenPosition + diceRoll) <= 56
}


/**
 *
 * @param {number} tokenPosition
 * @returns {boolean}
 */
export function isUnsafePosition(tokenPosition) {
    return ![0, 8, 13, 21, 26, 34, 39, 47].includes(tokenPosition) && tokenPosition < 51;
}