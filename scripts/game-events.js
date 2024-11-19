import {
    getTokenElementId,
    updateTokenContainer,
    showGame,
    showPauseMenu,
    resumeGame,
    animateDiceRoll,
    updateDiceFace,
    moveDice,
    activateToken,
    inactiveDice,
    inactiveTokens,
    activateDice,
    playPopSound,

    findCapturedOpponents,
    generateDiceRoll,
    getTokenNewPosition,
    isTokenMovable,
    isTripComplete, getPlayerTypes
} from "./index.js";

/**
 * @typedef {'PLAYER'|'BOT'} PlayerType
 */

let currentPlayerIndex = 2;
let currentDiceRoll = 1;
let consecutiveSixesCount = 0
let isAssistModeEnabled = false
let gameStartedAt = new Date().getTime()
let lastRank = 0

/**
 *
 * @type {PlayerType[]}
 */
export const playerTypes = new Array(4)
/**
 *
 * @type {number[]}
 */
export const playerRanks = new Array(4).fill(0)
/**
 *
 * @type {number[]}
 */
export const playerTimes = new Array(4).fill(0)
/**
 *
 * @type {number[]}
 */
export const playerCaptures = new Array(4).fill(0)
/**
 *
 * @type {number[][]}
 */
const playerTokenPositions = new Array(4);


/**
 *
 * @returns {boolean}
 */
function isCurrentPlayerBot() {
    return playerTypes[currentPlayerIndex] === "BOT"
}

/**
 *
 * @returns {boolean}
 */
function isAutoplay() {
    return isAssistModeEnabled || isCurrentPlayerBot()
}

/**
 *
 * @param {string} quickStartId
 */
function initPlayers(quickStartId) {
    getPlayerTypes(quickStartId).forEach((playerType, playerIndex) => {
        playerTypes[playerIndex] = playerType
        playerTokenPositions[playerIndex] = new Array(4).fill(-1)
    })
}

/**
 * @param {number} playerIndex
 * @returns {boolean}
 */
function isPlayerFinished(playerIndex) {
    return playerTokenPositions[playerIndex].find(tp => tp !== 56) === undefined
}

function updateCurrentPlayer() {
    consecutiveSixesCount = 0

    do {
        currentPlayerIndex = (currentPlayerIndex + 1) % 4
    } while (playerTypes[currentPlayerIndex] === undefined || isPlayerFinished(currentPlayerIndex))

    handlePayerUpdated()
}


/**
 *
 * @param {string} quickStartId
 */
export function handleGameStart(quickStartId) {
    gameStartedAt = new Date().getTime()

    initPlayers(quickStartId)

    showGame();

    const params = new URLSearchParams(window.location.search)
    const initPositions = params.get("positions")?.split(",")

    playerTypes.forEach((playerType, playerIndex) => {
        if (playerType) {
            playerTokenPositions[playerIndex].forEach((tokenPosition, tokenIndex) => {
                const token = document.createElement("wc-token")
                token.setAttribute("id", getTokenElementId(playerIndex, tokenIndex))
                document.getElementById(`h-${playerIndex}-${tokenIndex}`).appendChild(token)

                if (initPositions && initPositions[(playerIndex * 4) + tokenIndex] !== undefined) {
                    playerTokenPositions[playerIndex][tokenIndex] = +initPositions[(playerIndex * 4) + tokenIndex]
                    updateTokenContainer(playerIndex, tokenIndex, -1, playerTokenPositions[playerIndex][tokenIndex]).then()
                }
            })
        }
    })

    const player = params.get("player");
    if (player) {
        currentPlayerIndex = +player
    }

    moveDice(currentPlayerIndex)
}


export function handleGamePause() {
    showPauseMenu();

    document.getElementById("pm-resume").addEventListener("click", resumeGame)

    document.querySelectorAll(".restart-game").forEach(el => {
        el.addEventListener("click", () => {
            window.location.href = window.location.origin
        })
    })
}


export function handlePayerUpdated() {
    moveDice(currentPlayerIndex)
    handleDiceMoved()
}


export function handleDiceRoll() {
    animateDiceRoll(currentDiceRoll)
        .then(() => {
            const lastDiceRoll = currentDiceRoll
            currentDiceRoll = generateDiceRoll();

            updateDiceFace(lastDiceRoll, currentDiceRoll);

            if (currentDiceRoll === 6) {
                consecutiveSixesCount++
            }

            handleAfterDiceRoll()
        });
}


function handleAfterDiceRoll() {
    if (consecutiveSixesCount === 3) {
        updateCurrentPlayer()
    } else {
        const movableTokenElementIds = []

        playerTokenPositions[currentPlayerIndex].forEach((tokenPosition, tokenIndex) => {
            if (isTokenMovable(tokenPosition, currentDiceRoll)) {
                const tokenElementId = getTokenElementId(currentPlayerIndex, tokenIndex)
                activateToken(tokenElementId);
                movableTokenElementIds.push(tokenElementId)
            }
        })


        if (movableTokenElementIds.length > 0) {
            inactiveDice();

            if (isCurrentPlayerBot()) {
                // todo: make bot smarter
                document.getElementById(movableTokenElementIds[movableTokenElementIds.length - 1]).click()
            } else if (isAssistModeEnabled) {
                const tokenIndexPositions = movableTokenElementIds
                    .map(movableTokenElementId => {
                        const temp = movableTokenElementId.split("-");
                        return playerTokenPositions[+temp[1]][+temp[2]]
                    })
                const uniqueTokenIndexPositions = new Set(tokenIndexPositions)

                if (uniqueTokenIndexPositions.size === 1) {
                    const temp = movableTokenElementIds[0].split("-");
                    const tokenElementId = getTokenElementId(+temp[1], +temp[2]);
                    document.getElementById(tokenElementId).click()
                }
            }
        } else {
            updateCurrentPlayer()
        }
    }
}


/**
 *
 * @param {string} tokenId
 */
export function handleOnTokenMove(tokenId) {
    inactiveTokens();

    const tokenElementIdTokens = tokenId.split("-")
    const playerIndex = +tokenElementIdTokens[1]
    const tokenIndex = +tokenElementIdTokens[2]


    const tokenOldPosition = playerTokenPositions[currentPlayerIndex][tokenIndex]
    const tokenNewPosition = getTokenNewPosition(playerTokenPositions[currentPlayerIndex][tokenIndex], currentDiceRoll)
    playerTokenPositions[currentPlayerIndex][tokenIndex] = tokenNewPosition

    const tripComplete = isTripComplete(tokenNewPosition)

    updateTokenContainer(playerIndex, tokenIndex, tokenOldPosition, tokenNewPosition).then(() => {
        const otherPlayerTokensOnThatMarkIndex = findCapturedOpponents(playerIndex, tokenIndex, playerTokenPositions);
        let captureCount = 0
        otherPlayerTokensOnThatMarkIndex.forEach((pt, pi) => {
            pt.forEach((ti) => {
                updateTokenContainer(pi, ti, playerTokenPositions[pi][ti], -1).then()
                playerTokenPositions[pi][ti] = -1
                captureCount++
            })
        })

        if (captureCount > 0) {
            playPopSound()
            playerCaptures[currentPlayerIndex] += captureCount
        }

        handleAfterTokenMove(tripComplete, captureCount)
    })
}


/**
 *
 * @param {boolean} tripComplete
 * @param {number} captureCount
 */
function handleAfterTokenMove(tripComplete, captureCount) {
    let isGameDone = false;
    if (tripComplete && isPlayerFinished(currentPlayerIndex)) {
        playerRanks[currentPlayerIndex] = ++lastRank
        playerTimes[currentPlayerIndex] = new Date().getTime() - gameStartedAt

        let numberOfRemainingPlayers = 0;
        playerTypes.forEach((playerType, playerIndex) => {
            if (playerType && !isPlayerFinished(playerIndex)) {
                numberOfRemainingPlayers++;
            }
        })

        if (numberOfRemainingPlayers === 1) {
            playerTypes.forEach((playerType, playerIndex) => {
                if (playerType && playerRanks[playerIndex] === 0) {
                    playerRanks[playerIndex] = ++lastRank
                    playerTimes[playerIndex] = new Date().getTime() - gameStartedAt
                }
            })

            document.getElementById("game-container").appendChild(document.createElement("wc-game-end"))
            document.getElementById("game").classList.add("hidden")
            isGameDone = true;
        }
    }

    if (!isGameDone) {
        activateDice();

        const diceElement = document.getElementById("wc-dice");
        if (!tripComplete && captureCount === 0 && currentDiceRoll !== 6) {
            updateCurrentPlayer();
        } else {
            if (isAutoplay()) {
                diceElement.click()
            }
        }
    }
}


function handleDiceMoved() {
    if (isAutoplay()) {
        handleDiceRoll()
    }
}


/**
 * @param {boolean} assistMode
 */
export function handleAssistModeChanged(assistMode) {
    isAssistModeEnabled = assistMode
    // todo: start assisting right away...
}