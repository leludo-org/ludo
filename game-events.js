/**
 *
 * @typedef {'PLAYER_UPDATED'} GameEvent
 */


/**
 * @type {Record<GameEvent, CallableFunction>}
 */
const gameEventHandlers = {
    PLAYER_UPDATED: () => {
        console.log("this is player updated handler which doesn't do anything....yet")
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
    console.log("handling GameEvent", gameEvent);

    const handler = gameEventHandlers[gameEvent]
    handler.call()

    console.log("handled GameEvent", gameEvent);
}

window.addEventListener("message", (event) => handleGameEvent(event.data));