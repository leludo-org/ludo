/**
 *
 * @typedef {'PLAYER_UPDATED'|'DICE_MOVED'} GameEvent
 */

import {moveDice} from "./components/wc-dice.js";
import {rollDice} from "./main.js";
import {GameState} from "./gamestate.js";


/**
 * @type {GameState}
 */
export const gameState = new GameState()


/**
 * @type {Record<GameEvent, CallableFunction>}
 */
const gameEventHandlers = {
    PLAYER_UPDATED: () => {
        const targetContainerId = `b${gameState.currentPlayerIndex}`
        moveDice(targetContainerId)
    },
    DICE_MOVED: () => {
        if (gameState.isAutoplay()) {
            rollDice()
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