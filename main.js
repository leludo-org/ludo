import {gameState} from "./game-events.js"
import {getTokenNewPosition, isUnsafePosition} from "./game-logic.js";
import {
    activateDice,
    getTokenContainerId,
    getTokenElementId, inactiveTokens,
    updateTokenContainer
} from "./render-logic.js";

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

    activateDice();

    const diceElement = document.getElementById("wc-dice");
    if (!isTripComplete && !capturedOpponent && gameState.currentDiceRoll !== 6) {
        gameState.updateCurrentPlayer();
    } else {
        if (gameState.isAutoplay()) {
            diceElement.click()
        }
    }
}