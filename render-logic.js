function playPopSound() {
    document.getElementById("audio-pop").play()
}

/**
 *
 * @param {number} playerIndex
 * @param {number} tokenIndex
 * @param {number} tokenPosition
 * @return {string}
 */
export function getTokenContainerId(playerIndex, tokenIndex, tokenPosition) {
    if (tokenPosition === -1) {
        return `h-${playerIndex}-${tokenIndex}`
    }

    if (tokenPosition > 50) {
        const safeIndex = tokenPosition % 50;
        return `p${playerIndex}s${safeIndex}`
    }

    const markIndex = (tokenPosition + (13 * playerIndex)) % 52
    return `m${markIndex}`
}

/**
 *
 * @param {number} lastDiceRoll
 * @param {number} diceRoll
 */
export function updateDiceFace(lastDiceRoll, diceRoll) {
    document.getElementById(`d${lastDiceRoll}`).classList.add("hidden")
    document.getElementById(`d${diceRoll}`).classList.remove("hidden")
}

/**
 * @param {number} currentDiceRoll
 * @returns {Promise<void>}
 */
export function animateDiceRoll(currentDiceRoll) {
    playPopSound();

    return new Promise(resolve => {
        let diceRoll = currentDiceRoll

        let counter = 0;
        const interval = setInterval(() => {
            const lastDiceRoll = diceRoll

            if (counter === 8) {
                clearInterval(interval)
                console.debug(lastDiceRoll, currentDiceRoll);
                updateDiceFace(lastDiceRoll, currentDiceRoll);
                resolve()
            } else {
                diceRoll = (diceRoll % 6) + 1
                updateDiceFace(lastDiceRoll, diceRoll);
            }

            counter++
        }, 20)
    });
}