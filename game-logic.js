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

/**
 * @returns {number}
 */
export function generateDiceRoll() {
    const weights = [1, 2, 2, 1, 2, 2];
    const cumulativeWeights = weights.map((sum => value => sum += value)(0));
    const maxWeight = cumulativeWeights[cumulativeWeights.length - 1];
    const randomValue = Math.random() * maxWeight;
    return cumulativeWeights.findIndex(cw => randomValue < cw) + 1
}

/**
 *
 * @param {number} currentPosition
 * @param {number} diceRoll
 * @returns {number}
 */
export function getTokenNewPosition(currentPosition, diceRoll) {
    if (currentPosition === -1) {
        return 0;
    }

    return currentPosition + diceRoll
}