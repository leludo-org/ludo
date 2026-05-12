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
    const totalPlayers = humanCount + botCount

    if (humanCount === 4) {
        return ["PLAYER", "PLAYER", "PLAYER", "PLAYER"]
    }

    const chosenColors = parts.slice(3).map(Number)
    const result = new Array(4).fill(undefined)

    chosenColors.forEach(colorIndex => {
        result[colorIndex] = "PLAYER"
    })

    let botsPlaced = 0
    for (let i = 0; i < 4 && botsPlaced < botCount; i++) {
        if (result[i] === undefined) {
            result[i] = "BOT"
            botsPlaced++
        }
    }

    return result
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

/**
 *
 * @param {number} playerIndex
 * @param {number} tokenPosition
 * @param {number[][]} playerTokenPositions
 * @returns {boolean}
 */
function hasPossibleCaptures(playerIndex, tokenPosition, playerTokenPositions) {
    const possibleCaptures = findCapturedOpponents(playerIndex, tokenPosition, playerTokenPositions);
    return possibleCaptures.findIndex(pc => pc.length > 0) !== -1;
}

/**
 *
 * @param {number} playerIndex
 * @param {number[]} movableTokenIndexes
 * @param {number} diceRoll
 * @param {number[][]} playerTokenPositions
 * @returns {number}
 */
export function getBestPossibleTokenIndexForMove(playerIndex, movableTokenIndexes, diceRoll, playerTokenPositions) {
    let maxTokenWeight = -1000;
    let maxWeightedTokenIndex = 0;

    for (let i = 0; i < movableTokenIndexes.length; i++) {
        let tokenWeight = 0;

        const tokenIndex = movableTokenIndexes[i];
        const tokenCurrentPosition = playerTokenPositions[playerIndex][tokenIndex];
        const tokenNewPosition = getTokenNewPosition(tokenCurrentPosition, diceRoll);

        if (tokenNewPosition === 56) {
            tokenWeight += 20;
        } else if (hasPossibleCaptures(playerIndex, tokenNewPosition, playerTokenPositions)) {
            tokenWeight += 10;
        } else if (tokenNewPosition === 0) {
            tokenWeight += 3;
        } else if (isSafePosition(tokenNewPosition)) {
            tokenWeight += 5;
        } else if (isSafePosition(tokenCurrentPosition)) {
            tokenWeight -= 5;
        } else {
            tokenWeight += 1;
        }

        if (tokenWeight > maxTokenWeight) {
            maxTokenWeight = tokenWeight;
            maxWeightedTokenIndex = tokenIndex;
        }
    }

    return maxWeightedTokenIndex
}