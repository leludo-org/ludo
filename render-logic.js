import {updatePiecePositionAndMove} from "./main.js";
import {publishGameEvent} from "./game-events.js";

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

/**
 *
 * @param {number} playerIndex
 * @param {number} tokenIndex
 * @param {number} tokenPosition
 */
export function updateTokenContainer(playerIndex, tokenIndex, tokenPosition) {
    const targetContainerId = getTokenContainerId(playerIndex, tokenIndex, tokenPosition)

    const tokenElementId = getTokenElementId(playerIndex, tokenIndex)
    const element = document.getElementById(tokenElementId)
    const targetContainer = document.getElementById(targetContainerId)

    const previousContainer = element.parentElement

    targetContainer.appendChild(element)
    if (targetContainer.children.length > 1) {
        element.style.marginTop = `-100%`;
    } else {
        element.style.marginTop = "0";
    }

    if (previousContainer.children.length > 0) {
        previousContainer.children[0].style.marginTop = '0';
    }
}

/**
 *
 * @param {string} tokenElementId
 */
export function activateToken(tokenElementId) {
    const tokenElement = document.getElementById(tokenElementId);
    ["animate-bounce", "z-20"].forEach(c => tokenElement.children[0].classList.add(c))
    tokenElement.addEventListener("click", updatePiecePositionAndMove)// todo: should not be imported here: updatePiecePositionAndMove
}

export function inactiveTokens() {
    document.querySelectorAll(".animate-bounce").forEach(element => {
        ["animate-bounce", "z-20"].forEach(c => element.classList.remove(c))
        element.parentElement.removeEventListener("click", updatePiecePositionAndMove) // todo: should not be imported here: updatePiecePositionAndMove
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
 * @param {string} targetContainerId
 */
export function moveDice(targetContainerId) {
    const diceElement = document.getElementById("wc-dice")
    const targetContainer = document.getElementById(targetContainerId)
    targetContainer.appendChild(diceElement)

    publishGameEvent("DICE_MOVED")
}