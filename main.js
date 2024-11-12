import {gameState, publishGameEvent} from "./game-events.js"
import {generateDiceRoll, getTokenNewPosition, isTokenMovable, isUnsafePosition} from "./game-logic.js";
import {
    activateToken, activeDice,
    animateDiceRoll,
    getTokenContainerId,
    getTokenElementId, inactiveDice, inactiveTokens,
    updateDiceFace,
    updateTokenContainer
} from "./render-logic.js";


document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("audio-pop").volume = 0.6

    document.querySelectorAll(".quick-start").forEach((el) => {
        const quickStartId = el.id

        el.addEventListener("click", () => {
            gameState.initPlayers(quickStartId)
            setInitialState()

            document.getElementById("main-menu").classList.add("hidden")
            document.getElementById("game").classList.remove("hidden")

            if (gameState.isAutoplay()) {
                rollDice()
            }
        })
    })

    document.getElementById("g-pause").addEventListener("click", () => {
        document.getElementById("game").classList.add("hidden")
        document.getElementById("pause-menu").classList.remove("hidden")
    })

    document.getElementById("pm-resume").addEventListener("click", () => {
        document.getElementById("pause-menu").classList.add("hidden")
        document.getElementById("game").classList.remove("hidden")
    })

    document.querySelectorAll(".restart-game").forEach(el => {
        el.addEventListener("click", () => {
            window.location.href = window.location.origin
        })
    })

})

function setInitialState() {
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
                    updateTokenContainer(playerIndex, tokenIndex, playerState.tokenPositions[tokenIndex])
                }
            })
        }
    })

    const player = params.get("player");
    if (player) {
        gameState.currentPlayerIndex = +player
    }

    publishGameEvent("PLAYER_UPDATED")
}


export function rollDice() {
    animateDiceRoll(gameState.currentDiceRoll)
        .then(() => {
            const lastDiceRoll = gameState.currentDiceRoll
            gameState.currentDiceRoll = generateDiceRoll();

            updateDiceFace(lastDiceRoll, gameState.currentDiceRoll);

            if (gameState.currentDiceRoll === 6) {
                gameState.consecutiveSixesCount++
            }

            if (gameState.consecutiveSixesCount === 3) {
                gameState.updateCurrentPlayer()
            } else {
                animateMovablePieces()
            }
        });
}


// todo: optimize to remove unwarranted actions during autoplay
function animateMovablePieces() {
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
            // const tokenIndexPositions = movableTokenElementIds
            //     .map(tokenIndex => gameState.playerStates[Math.floor(tokenIndex / 4)][tokenIndex % 4])
            // const uniqueTokenIndexPositions = new Set(tokenIndexPositions)
            //
            // if (uniqueTokenIndexPositions.size === 1) {
            //     const tokenElementId = getPieceElementId(movableTokenElementIds[0]);
            //     document.getElementById(tokenElementId).click()
            // }
        }
    } else {
        gameState.updateCurrentPlayer()
    }
}

/**
 *
 * @param {number} currentPlayerIndex
 * @param {number} currentTokenIndex
 * @returns {boolean}
 */
function captureOpponentPieces(currentPlayerIndex, currentTokenIndex) {
    const tokenPosition = gameState.playerStates[currentPlayerIndex].tokenPositions[currentTokenIndex]
    if (isUnsafePosition(tokenPosition)) {
        const targetPieceContainerId = getTokenContainerId(currentPlayerIndex, currentTokenIndex, tokenPosition);
        const piecesAlreadyThere = [];

        gameState.playerStates.forEach((playerState, playerIndex) => {
            if (playerIndex !== currentPlayerIndex && playerState) {
                playerState.tokenPositions.forEach((tokenPosition, tokenIndex) => {
                    if (targetPieceContainerId === getTokenContainerId(playerIndex, tokenIndex, tokenPosition)) {
                        piecesAlreadyThere.push(getTokenElementId(playerIndex, tokenIndex))
                    }
                })
            }
        })

        const numberOfPieceByPlayer = new Array(4).fill(0)
        piecesAlreadyThere.forEach(pi => {
            numberOfPieceByPlayer[+pi.split("-")[1]] += 1
        })

        let captured = false
        piecesAlreadyThere.forEach(pi => {
            const playerIndex = +pi.split("-")[1];
            const tokenIndex = +pi.split("-")[2];
            if (numberOfPieceByPlayer[playerIndex] !== 2) {
                gameState.playerStates[playerIndex].tokenPositions[tokenIndex] = -1
                updateTokenContainer(playerIndex, tokenIndex, -1)
                captured = true
            }
        })

        if (captured) {
            document.getElementById("audio-pop").play()
        }

        return captured
    }
}



/**
 *
 * @param {PointerEvent} $event
 */
export function updatePiecePositionAndMove($event) {
    inactiveTokens();

    const tokenElementIdTokens = $event.currentTarget.id.split("-")
    const playerIndex = +tokenElementIdTokens[1]
    const tokenIndex = +tokenElementIdTokens[2]


    const tokenNewPosition = getTokenNewPosition(gameState.getCurrentPlayerTokenPositions()[tokenIndex], gameState.currentDiceRoll)
    gameState.getCurrentPlayerTokenPositions()[tokenIndex] = tokenNewPosition

    const isTripComplete = tokenNewPosition === 56

    // todo: no need to check if position is one of the safe position
    const capturedOpponent = captureOpponentPieces(playerIndex, tokenIndex);

    updateTokenContainer(playerIndex, tokenIndex, tokenNewPosition)

    if (isTripComplete && gameState.playerStates[gameState.currentPlayerIndex].isFinished()) {
        let numberOfRemainingPlayers = 0;
        gameState.playerStates.forEach((playerState) => {
            if (playerState && !playerState.isFinished()) {
                numberOfRemainingPlayers++;
            }
        })

        if (numberOfRemainingPlayers === 1) {
            document.getElementById("game-end").classList.remove("hidden")
            document.getElementById("game").classList.add("hidden")
        }
    }

    activeDice();

    const diceElement = document.getElementById("wc-dice");
    if (!isTripComplete && !capturedOpponent && gameState.currentDiceRoll !== 6) {
        gameState.updateCurrentPlayer();
    } else {
        if (gameState.isAutoplay()) {
            diceElement.click()
        }
    }
}