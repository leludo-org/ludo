/**
 *
 * @param {number} tokenPosition
 * @param {number} diceRoll
 */
export function isTokenMovable(tokenPosition, diceRoll) {
    if (diceRoll === 6 && tokenPosition === -1) {
        return true
    }

    return tokenPosition >= 0 && (tokenPosition + diceRoll) <= 56
}