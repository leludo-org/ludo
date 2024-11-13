/**
 *
 * @typedef {'GAME_LOADED'|'GAME_STARTED'|'GAME_PAUSED'|'PLAYER_UPDATED'|'DICE_ROLLED'|'DICE_MOVED'} GameEvent
 */

import {animateMovablePieces} from "./main.js";
import {GameState} from "./gamestate.js";
import {
    getTokenElementId,
    updateTokenContainer,
    showGame,
    showPauseMenu,
    resumeGame,
    animateDiceRoll, updateDiceFace, moveDice
} from "./render-logic.js";
import {generateDiceRoll} from "./game-logic.js";


/**
 * @type {GameState}
 */
export const gameState = new GameState()


/**
 * @type {Record<GameEvent, CallableFunction>}
 */
const gameEventHandlers = {
    GAME_LOADED: () => {
        document.getElementById("audio-pop").volume = 0.6

        document.querySelectorAll(".quick-start").forEach((el) => {
            const quickStartId = el.id

            el.addEventListener("click", () => {
                gameState.initPlayers(quickStartId)
                publishGameEvent("GAME_STARTED")
            })
        })
    },
    GAME_STARTED: () => {
        showGame();

        document.getElementById("g-pause").addEventListener("click", () => {
            publishGameEvent("GAME_PAUSED")
        })

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

        if (gameState.isAutoplay()) {
            publishGameEvent("DICE_ROLLED")
        }
    },
    GAME_PAUSED: () => {
        showPauseMenu();

        document.getElementById("pm-resume").addEventListener("click", resumeGame)

        document.querySelectorAll(".restart-game").forEach(el => {
            el.addEventListener("click", () => {
                window.location.href = window.location.origin
            })
        })
    },
    PLAYER_UPDATED: () => {
        const targetContainerId = `b${gameState.currentPlayerIndex}`
        moveDice(targetContainerId)
    },
    DICE_ROLLED: () => {
        const isDiceActive = document.getElementById("wc-dice").classList.contains("animate-bounce");
        if (!isDiceActive) {
            return
        }

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
    },
    DICE_MOVED: () => {
        if (gameState.isAutoplay()) {
            publishGameEvent("DICE_ROLLED")
        }
    }
}


/**
 * @param {GameEvent} gameEvent
 */
export const publishGameEvent = (gameEvent) => {
    window.postMessage(gameEvent);
}


/**
 * @param {GameEvent} gameEvent
 */
const handleGameEvent = (gameEvent) => {
    console.debug("handling GameEvent", gameEvent);

    const handler = gameEventHandlers[gameEvent]
    handler.call()

    console.debug("handled GameEvent", gameEvent);
}

window.addEventListener("message", (event) => handleGameEvent(event.data));

document.addEventListener("DOMContentLoaded", () => {
    publishGameEvent("GAME_LOADED")
})