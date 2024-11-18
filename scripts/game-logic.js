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
 * @param playerIndex
 * @param tokenPosition
 * @returns {undefined|number}
 */
export function getMarkIndex(playerIndex, tokenPosition) {
    if (tokenPosition === -1 || tokenPosition > 50) {
        return undefined
    }

    return (tokenPosition + (13 * playerIndex)) % 52;
}


/**
 *
 * @param {number} tokenPosition
 * @returns {boolean}
 */
export function isSafePosition(tokenPosition) {
    return [0, 8, 13, 21, 26, 34, 39, 47].includes(tokenPosition) || tokenPosition > 50;
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

/**
 *
 * @param {number} playerIndex
 * @param {number} tokenIndex
 * @param {number[][]} tokenPositions
 * @returns {number[][]}
 */
export function findCapturedOpponents(playerIndex, tokenIndex, tokenPositions) {
    const tokenPosition = tokenPositions[playerIndex][tokenIndex]

    if (isSafePosition(tokenPosition)) {
        return new Array(0)
    }

    const tokenMarkIndex = getMarkIndex(playerIndex, tokenPosition);
    const otherPlayerTokensOnThatMarkIndex = new Array(4);

    tokenPositions.forEach((ptp, pi) => {
        otherPlayerTokensOnThatMarkIndex[pi] = [];
        if (ptp && pi !== playerIndex) {
            ptp.forEach((tp, ti) => {
                const tMarkIndex = getMarkIndex(pi, tp);
                if (tokenMarkIndex === tMarkIndex) {
                    otherPlayerTokensOnThatMarkIndex[pi].push(ti)
                }
            })
        }
    })

    // if 2 tokens then that player is safe
    otherPlayerTokensOnThatMarkIndex.forEach((pt, pi) => {
        if (pt.length === 2) {
            otherPlayerTokensOnThatMarkIndex[pi] = new Array(0)
        }
    })

    return otherPlayerTokensOnThatMarkIndex
}

/**
 *
 * @param {number} tokenPosition
 * @returns {boolean}
 */
export function isTripComplete(tokenPosition) {
    return tokenPosition === 56;
}

/**
 *
 * @param {string} quickStartId
 * @return {PlayerType[]}
 */
export function getPlayerTypes(quickStartId) {
    switch (quickStartId) {
        case "qs,1,1":
            return ["BOT", undefined, "PLAYER", undefined]
        case "qs,1,2":
            return [undefined, "BOT", "PLAYER", "BOT"]
        case "qs,1,3":
            return ["BOT", "BOT", "PLAYER", "BOT"]
        case "qs,2,0":
            return ["PLAYER", undefined, "PLAYER", undefined]
        case "qs,2,1":
            return ["PLAYER", undefined, "PLAYER", "BOT"]
        case "qs,2,2":
            return ["PLAYER", "BOT", "PLAYER", "BOT"]
        case "qs,3,0":
            return ["PLAYER", undefined, "PLAYER", "PLAYER"]
        case "qs,3,1":
            return ["PLAYER", "BOT", "PLAYER", "PLAYER"]
        case "qs,4,0":
            return ["PLAYER", "PLAYER", "PLAYER", "PLAYER"]
    }
}