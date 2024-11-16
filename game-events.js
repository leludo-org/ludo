/**
 *
 * @typedef {'GAME_LOADED'|'GAME_STARTED'|'GAME_PAUSED'|'PLAYER_UPDATED'|'ON_DICE_ROLLED'|'AFTER_DICE_ROLLED'|'ON_TOKEN_MOVE'|'AFTER_TOKEN_MOVE'|'DICE_MOVED'} GameEvent
 */

import {GameState} from "./gamestate.js";
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
} from "./render-logic.js";
import {findCapturedOpponents, generateDiceRoll, getTokenNewPosition, isTokenMovable} from "./game-logic.js";


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
            publishGameEvent("ON_DICE_ROLLED")
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
        publishGameEvent("DICE_MOVED")
    },
    ON_DICE_ROLLED: () => {
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

                publishGameEvent("AFTER_DICE_ROLLED")
            });
    },
    AFTER_DICE_ROLLED: () => {
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
    },
    /**
     *
     * @param {string} tokenId
     */
    ON_TOKEN_MOVE: (tokenId) => {
        const isTokenActive = document.getElementById(tokenId).children[0].classList.contains("animate-bounce");
        if (!isTokenActive) {
            return
        }

        inactiveTokens();

        const tokenElementIdTokens = tokenId.split("-")
        const playerIndex = +tokenElementIdTokens[1]
        const tokenIndex = +tokenElementIdTokens[2]


        const tokenNewPosition = getTokenNewPosition(gameState.getCurrentPlayerTokenPositions()[tokenIndex], gameState.currentDiceRoll)
        gameState.getCurrentPlayerTokenPositions()[tokenIndex] = tokenNewPosition

        const isTripComplete = tokenNewPosition === 56

        // todo: no need to check if position is one of the safe position
        const otherPlayerTokensOnThatMarkIndex = findCapturedOpponents(playerIndex, tokenIndex, gameState.playerStates.map(ps => ps?.tokenPositions));
        let captureCount = 0
        otherPlayerTokensOnThatMarkIndex.forEach((pt, pi) => {
            pt.forEach((ti) => {
                gameState.playerStates[pi].tokenPositions[ti] = -1
                updateTokenContainer(pi, ti, -1)
                captureCount++
            })
        })

        if (captureCount > 0) {
            playPopSound()
            gameState.playerStates[gameState.currentPlayerIndex].captures += captureCount
        }

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
                const lastPlayerState = gameState.playerStates.find(ps => ps && !ps.rank)
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
        if (!isTripComplete && captureCount === 0 && gameState.currentDiceRoll !== 6) {
            gameState.updateCurrentPlayer();
        } else {
            if (gameState.isAutoplay()) {
                diceElement.click()
            }
        }
    },
    AFTER_TOKEN_MOVE: () => {

    },
    DICE_MOVED: () => {
        if (gameState.isAutoplay()) {
            publishGameEvent("ON_DICE_ROLLED")
        }
    }
}


/**
 * @param {GameEvent} gameEvent
 * @param {any} [data]
 */
export const publishGameEvent = (gameEvent, data) => {
    window.postMessage({gameEvent, data});
}


/**
 * @param {GameEvent} gameEvent
 * @param {any} [data]
 */
const handleGameEvent = ({gameEvent, data}) => {
    console.debug("handling GameEvent", gameEvent);

    const handler = gameEventHandlers[gameEvent]
    handler(data)

    console.debug("handled GameEvent", gameEvent);
}

window.addEventListener("message", (event) => handleGameEvent(event.data));

document.addEventListener("DOMContentLoaded", () => {
    publishGameEvent("GAME_LOADED")
})