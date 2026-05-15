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
 * @param {number} tokenPosition
 * @param {number[][]} tokenPositions
 * @returns {number[][]}
 */
export function findCapturedOpponents(playerIndex, tokenPosition, tokenPositions) {
    if (isSafePosition(tokenPosition)) {
        return new Array(0)
    }

    const tokenMarkIndex = getMarkIndex(playerIndex, tokenPosition);
    const otherPlayerTokensOnThatMarkIndex = new Array(4);

    for (let pi = 0; pi < tokenPositions.length; pi++) {
        const ptp = tokenPositions[pi];
        otherPlayerTokensOnThatMarkIndex[pi] = [];
        if (ptp && pi !== playerIndex) {
            for (let ti = 0; ti < ptp.length; ti++) {
                const tp = ptp[ti];
                const tMarkIndex = getMarkIndex(pi, tp);
                if (tokenMarkIndex === tMarkIndex) {
                    otherPlayerTokensOnThatMarkIndex[pi].push(ti)
                }
            }
        }
    }

    // if 2 tokens then that player is safe
    for (let pi = 0; pi < otherPlayerTokensOnThatMarkIndex.length; pi++) {
        const pt = otherPlayerTokensOnThatMarkIndex[pi];
        if (pt.length === 2) {
            otherPlayerTokensOnThatMarkIndex[pi] = new Array(0)
        }
    }

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
    const parts = quickStartId.split(",")
    const humanCount = +parts[1]
    const botCount = +parts[2]

    if (humanCount === 4) {
        return {
            playerTypes: ["PLAYER", "PLAYER", "PLAYER", "PLAYER"],
            colorMap: [0, 1, 2, 3]
        }
    }

    const chosenColors = parts.slice(3).filter(s => s !== "").map(Number)
    const preferredPositions = [2, 0, 1, 3]

    const playerTypes = new Array(4).fill(undefined)
    const colorMap = new Array(4).fill(-1)
    const usedColors = new Set()
    const usedPositions = new Set()

    chosenColors.forEach((color, i) => {
        const pos = preferredPositions[i]
        playerTypes[pos] = "PLAYER"
        colorMap[pos] = color
        usedColors.add(color)
        usedPositions.add(pos)
    })

    const remainingColors = [0, 1, 2, 3].filter(c => !usedColors.has(c))
    let botIdx = 0
    let colorIdx = 0

    for (let pos = 0; pos < 4 && botIdx < botCount; pos++) {
        if (!usedPositions.has(pos)) {
            playerTypes[pos] = "BOT"
            colorMap[pos] = remainingColors[colorIdx++]
            usedPositions.add(pos)
            botIdx++
        }
    }

    for (let pos = 0; pos < 4; pos++) {
        if (colorMap[pos] === -1) {
            colorMap[pos] = remainingColors[colorIdx++]
        }
    }

    return { playerTypes, colorMap }
}

/**
 *
 * @param {number} playerIndex
 * @param {number[]} movableTokenIndexes
 * @param {number[][]} playerTokenPositions
 * @returns {Set<number>}
 */
export function getUniqueTokenPositions(playerIndex, movableTokenIndexes, playerTokenPositions) {
    const tokenIndexPositions = movableTokenIndexes
        .map(movableTokenIndex => {
            return playerTokenPositions[playerIndex][movableTokenIndex]
        })
    return new Set(tokenIndexPositions);
}

