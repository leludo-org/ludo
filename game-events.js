/**
 *
 * @typedef {'PLAYER_UPDATED'} GameEvent
 */


import {moveDice} from "./main.js";

/**
 * @type {Record<GameEvent, CallableFunction>}
 */
const gameEventHandlers = {
    PLAYER_UPDATED: () => {
        moveDice()
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