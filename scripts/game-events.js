import {
    GameState,

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
    isTripComplete
} from "./index.js";


/**
 * @type {GameState}
 */
export const gameState = new GameState()

/**
 *
 * @param {string} quickStartId
 */
export function handleGameStart(quickStartId) {
    gameState.initPlayers(quickStartId)

    showGame();

    const params = new URLSearchParams(window.location.search)
    const initPositions = params.get("positions")?.split(",")

    gameState.playerStates.forEach((playerState, playerIndex) => {
        if (playerState) {
            playerState.tokenPositions.forEach((tokenPosition, tokenIndex) => {
                const token = document.createElement("wc-token")
                token.setAttribute("id", getTokenElementId(playerIndex, tokenIndex))
                document.getElementById(`h-${playerIndex}-${tokenIndex}`).appendChild(token)

                if (initPositions && initPositions[(playerIndex * 4) + tokenIndex] !== undefined) {
                    playerState.tokenPositions[tokenIndex] = +initPositions[(playerIndex * 4) + tokenIndex]
                    updateTokenContainer(playerIndex, tokenIndex, -1, playerState.tokenPositions[tokenIndex]).then()
                }
            })
        }
    })

    const player = params.get("player");
    if (player) {
        gameState.currentPlayerIndex = +player
    }

    handlePayerUpdated()

    if (gameState.isAutoplay()) {
        handleDiceRoll()
    }
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
    const targetContainerId = `b${gameState.currentPlayerIndex}`
    moveDice(targetContainerId)
    handleDiceMoved()
}


export function handleDiceRoll() {

    animateDiceRoll(gameState.currentDiceRoll)
        .then(() => {
            const lastDiceRoll = gameState.currentDiceRoll
            gameState.currentDiceRoll = generateDiceRoll();

            updateDiceFace(lastDiceRoll, gameState.currentDiceRoll);

            if (gameState.currentDiceRoll === 6) {
                gameState.consecutiveSixesCount++
            }

            handleAfterDiceRoll()
        });
}


function handleAfterDiceRoll() {
    if (gameState.consecutiveSixesCount === 3) {
        gameState.updateCurrentPlayer()
    } else {
        const movableTokenElementIds = []

        gameState.getCurrentPlayerTokenPositions().forEach((tokenPosition, tokenIndex) => {
            if (isTokenMovable(tokenPosition, gameState.currentDiceRoll)) {
                const tokenElementId = getTokenElementId(gameState.currentPlayerIndex, tokenIndex)
                activateToken(tokenElementId);
                movableTokenElementIds.push(tokenElementId)
            }
        })


        if (movableTokenElementIds.length > 0) {
            inactiveDice();

            if (gameState.isCurrentPlayerBot()) {
                // todo: make bot smarter
                document.getElementById(movableTokenElementIds[movableTokenElementIds.length - 1]).click()
            } else if (gameState.autoplay) {
                const tokenIndexPositions = movableTokenElementIds
                    .map(movableTokenElementId => {
                        const temp = movableTokenElementId.split("-");
                        return gameState.playerStates[+temp[1]].tokenPositions[+temp[2]]
                    })
                const uniqueTokenIndexPositions = new Set(tokenIndexPositions)

                if (uniqueTokenIndexPositions.size === 1) {
                    const temp = movableTokenElementIds[0].split("-");
                    const tokenElementId = getTokenElementId(+temp[1], +temp[2]);
                    document.getElementById(tokenElementId).click()
                }
            }
        } else {
            gameState.updateCurrentPlayer()
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


    const tokenOldPosition = gameState.getCurrentPlayerTokenPositions()[tokenIndex]
    const tokenNewPosition = getTokenNewPosition(gameState.getCurrentPlayerTokenPositions()[tokenIndex], gameState.currentDiceRoll)
    gameState.getCurrentPlayerTokenPositions()[tokenIndex] = tokenNewPosition

    const tripComplete = isTripComplete(tokenNewPosition)

    const otherPlayerTokensOnThatMarkIndex = findCapturedOpponents(playerIndex, tokenIndex, gameState.playerStates.map(ps => ps?.tokenPositions));
    let captureCount = 0
    otherPlayerTokensOnThatMarkIndex.forEach((pt, pi) => {
        pt.forEach((ti) => {
            updateTokenContainer(pi, ti, gameState.playerStates[pi].tokenPositions[ti], -1).then()
            gameState.playerStates[pi].tokenPositions[ti] = -1
            captureCount++
        })
    })

    if (captureCount > 0) {
        playPopSound()
        gameState.playerStates[gameState.currentPlayerIndex].captures += captureCount
    }

    updateTokenContainer(playerIndex, tokenIndex, tokenOldPosition, tokenNewPosition).then(() => {
        handleAfterTokenMove(tripComplete, captureCount)
    })
}


/**
 *
 * @param {boolean} tripComplete
 * @param {number} captureCount
 */
function handleAfterTokenMove(tripComplete, captureCount) {
    const currentPlayerState = gameState.playerStates[gameState.currentPlayerIndex];
    let isGameDone = false;
    if (tripComplete && currentPlayerState.isFinished()) {
        currentPlayerState.rank = gameState.lastRank + 1
        currentPlayerState.time = new Date().getTime() - gameState.startAt

        gameState.lastRank = currentPlayerState.rank

        let numberOfRemainingPlayers = 0;
        gameState.playerStates.forEach((playerState) => {
            if (playerState && !playerState.isFinished()) {
                numberOfRemainingPlayers++;
            }
        })

        if (numberOfRemainingPlayers === 1) {
            const lastPlayerState = gameState.playerStates.find(ps => ps && !ps.rank)
            lastPlayerState.rank = gameState.lastRank + 1
            lastPlayerState.time = new Date().getTime() - gameState.startAt

            document.getElementById("game-container").appendChild(document.createElement("wc-game-end"))
            document.getElementById("game").classList.add("hidden")
            isGameDone = true;
        }
    }

    if (!isGameDone) {
        activateDice();

        const diceElement = document.getElementById("wc-dice");
        if (!tripComplete && captureCount === 0 && gameState.currentDiceRoll !== 6) {
            gameState.updateCurrentPlayer();
        } else {
            if (gameState.isAutoplay()) {
                diceElement.click()
            }
        }
    }
}


function handleDiceMoved() {
    if (gameState.isAutoplay()) {
        handleDiceRoll()
    }
}


/**
 * @param {boolean} assistMode
 */
export function handleAssistModeChanged(assistMode) {
    gameState.autoplay = assistMode
    // todo: start assisting right away...
}