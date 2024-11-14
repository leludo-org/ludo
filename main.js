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
 * @returns {number}
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

        let numberOfCapture = 0
        piecesAlreadyThere.forEach(pi => {
            const playerIndex = +pi.split("-")[1];
            const tokenIndex = +pi.split("-")[2];
            if (numberOfPieceByPlayer[playerIndex] !== 2) {
                gameState.playerStates[playerIndex].tokenPositions[tokenIndex] = -1
                updateTokenContainer(playerIndex, tokenIndex, -1)
                numberOfCapture++
            }
        })

        if (numberOfCapture > 0) {
            document.getElementById("audio-pop").play()
        }

        return numberOfCapture
    }

    return 0
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
    const numberOfCaptures = captureOpponentPieces(playerIndex, tokenIndex);
    gameState.playerStates[gameState.currentPlayerIndex].captures += numberOfCaptures

    updateTokenContainer(playerIndex, tokenIndex, tokenNewPosition)

    const currentPlayerState = gameState.playerStates[gameState.currentPlayerIndex];
    if (isTripComplete && currentPlayerState.isFinished()) {
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
            const lastPlayerState = gameState.playerStates.find(ps => !ps.rank)
            lastPlayerState.rank = gameState.lastRank + 1
            lastPlayerState.time = new Date().getTime() - gameState.startAt

            document.getElementById("game-container").appendChild(
                document.createElement("wc-game-end")
            )
            document.getElementById("game").classList.add("hidden")
        }
    }

    activateDice();

    const diceElement = document.getElementById("wc-dice");
    if (!isTripComplete && numberOfCaptures === 0 && gameState.currentDiceRoll !== 6) {
        gameState.updateCurrentPlayer();
    } else {
        if (gameState.isAutoplay()) {
            diceElement.click()
        }
    }
}