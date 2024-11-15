import {getTokenContainerId, getTokenElementId, updateTokenContainer} from "./render-logic.js"; // todo: should not depend on any render logic here

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
 * @returns {string[]}
 */
export function findCapturedOpponents(playerIndex, tokenIndex, tokenPositions) {
    // todo: refactor such that there is no use of any render logic here, for example game logic based on token ids

    const tokenPosition = tokenPositions[playerIndex][tokenIndex]

    if (isSafePosition(tokenPosition)) {
        return []
    }

    const tokenTargetContainerId = getTokenContainerId(playerIndex, tokenIndex, tokenPosition);
    const piecesAlreadyThere = [];

    tokenPositions.forEach((ptp, pi) => {
        if (ptp && pi !== playerIndex) {
            ptp.forEach((tp, ti) => {
                const tContainerId = getTokenContainerId(pi, ti, tp);
                if (tokenTargetContainerId === tContainerId) {
                    piecesAlreadyThere.push(getTokenElementId(pi, ti))
                }
            })
        }
    })

    const numberOfPieceByPlayer = new Array(4).fill(0)
    piecesAlreadyThere.forEach(pi => {
        numberOfPieceByPlayer[+pi.split("-")[1]] += 1
    })

    const capturedTokenIds = []
    piecesAlreadyThere.forEach(pat => {
        const pi = +pat.split("-")[1];
        const ti = +pat.split("-")[2];
        if (numberOfPieceByPlayer[pi] !== 2) {
            capturedTokenIds.push(getTokenElementId(pi, ti))
        }
    })

    return capturedTokenIds
}