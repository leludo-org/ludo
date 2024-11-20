import {getMarkIndex} from "./index.js";

export function playPopSound() {
    const popSound = document.getElementById("audio-pop");
    popSound.pause();
    popSound.currentTime = 0;
    popSound.play()
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

    const markIndex = getMarkIndex(playerIndex, tokenPosition)
    return `m${markIndex}`
}

/**
 *
 * @param {number} playerIndex
 * @param {number} tokenIndex
 * @returns {string}
 */
export function getTokenElementId(playerIndex, tokenIndex) {
    return `p-${playerIndex}-${tokenIndex}`;
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

/**
 *
 * @param {number} playerIndex
 * @param {number} tokenIndex
 * @param {number} currentTokenPosition
 * @param {number} newTokenPosition
 * @returns {Promise<void>}
 */
export function updateTokenContainer(playerIndex, tokenIndex, currentTokenPosition, newTokenPosition) {
    console.debug("updateTokenContainer", playerIndex, tokenIndex, currentTokenPosition, newTokenPosition)

    let nextTokenPosition = [-1, 0].includes(newTokenPosition) ? newTokenPosition : currentTokenPosition + 1;
    return new Promise((resolve) => {
        const newContainerId = getTokenContainerId(playerIndex, tokenIndex, nextTokenPosition)

        const tokenElementId = getTokenElementId(playerIndex, tokenIndex)
        const element = document.getElementById(tokenElementId)
        const targetContainer = document.getElementById(newContainerId)

        const initialPosition = element.getBoundingClientRect()
        const finalPosition = targetContainer.getBoundingClientRect()

        const offsetX = finalPosition.left - initialPosition.left
        const offsetY = finalPosition.top - initialPosition.top

        element.style.transform = `translate(${offsetX}px, ${offsetY}px)`
        setTimeout(() => {
            element.style.removeProperty("transform");
            targetContainer.appendChild(element)
            if (nextTokenPosition === newTokenPosition) {
                resolve()
            } else {
                return updateTokenContainer(playerIndex, tokenIndex, nextTokenPosition, newTokenPosition).then(() => resolve())
            }
        }, 120)
    })
}

/**
 *
 * @param {number} currentPlayerIndex
 * @param {number} tokenIndex
 */
export function activateToken(currentPlayerIndex, tokenIndex) {
    const tokenElementId = getTokenElementId(currentPlayerIndex, tokenIndex)
    const tokenElement = document.getElementById(tokenElementId);
    ["animate-bounce", "z-20"].forEach(c => tokenElement.children[0].classList.add(c))
}

export function inactiveTokens() {
    document.querySelectorAll(".animate-bounce").forEach(element => {
        ["animate-bounce", "z-20"].forEach(c => element.classList.remove(c))
    })
}

export function activateDice() {
    const diceElement = document.getElementById("wc-dice");
    diceElement.classList.add("animate-bounce")
}

export function inactiveDice() {
    const diceElement = document.getElementById("wc-dice")
    diceElement.classList.remove("animate-bounce")
}

export function showGame() {
    document.getElementById("main-menu").classList.add("hidden")
    document.getElementById("game").classList.remove("hidden")
}

export function showPauseMenu() {
    document.getElementById("game").classList.add("hidden")
    document.getElementById("pause-menu").classList.remove("hidden")
}

export function resumeGame() {
    document.getElementById("pause-menu").classList.add("hidden")
    document.getElementById("game").classList.remove("hidden")

    document.getElementById("pm-resume").removeEventListener("click", resumeGame)
}

/**
 *
 * @param {number} currentPlayerIndex
 */
export function moveDice(currentPlayerIndex) {
    const targetContainerId = `b${currentPlayerIndex}`
    const diceElement = document.getElementById("wc-dice")
    const targetContainer = document.getElementById(targetContainerId)
    targetContainer.appendChild(diceElement)
}