import {getMarkIndex} from "./index.js";

let cachedPopSound = null;
export function playPopSound() {
    if (!cachedPopSound) cachedPopSound = document.getElementById("audio-pop");
    cachedPopSound.currentTime = 0;
    cachedPopSound.play().catch(() => {})
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

    const diceContainer = document.getElementById("dice");
    diceContainer.classList.add("dice-rolling");
    diceContainer.addEventListener("animationend", () => {
        diceContainer.classList.remove("dice-rolling");
    }, { once: true });

    return new Promise(resolve => {
        let diceRoll = currentDiceRoll
        let counter = 0;
        const delays = [20, 20, 20, 20, 20, 40, 60, 80];
        let lastTime = 0;

        function tick(timestamp) {
            if (!lastTime) lastTime = timestamp;

            if (timestamp - lastTime < delays[counter]) {
                requestAnimationFrame(tick);
                return;
            }
            lastTime = timestamp;

            const lastDiceRoll = diceRoll;

            if (counter === 8) {
                updateDiceFace(lastDiceRoll, currentDiceRoll);
                resolve();
                return;
            }

            diceRoll = (diceRoll % 6) + 1;
            updateDiceFace(lastDiceRoll, diceRoll);
            counter++;
            requestAnimationFrame(tick);
        }

        requestAnimationFrame(tick);
    });
}

function getContainerPath(playerIndex, tokenIndex, currentPosition, newPosition) {
    if ([-1, 0].includes(newPosition)) {
        return [getTokenContainerId(playerIndex, tokenIndex, newPosition)];
    }
    const path = [];
    for (let pos = currentPosition + 1; pos <= newPosition; pos++) {
        path.push(getTokenContainerId(playerIndex, tokenIndex, pos));
    }
    return path;
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

    const path = getContainerPath(playerIndex, tokenIndex, currentTokenPosition, newTokenPosition);
    const element = document.getElementById(getTokenElementId(playerIndex, tokenIndex));

    let stepIndex = 0;

    return new Promise((resolve) => {
        function step() {
            if (stepIndex >= path.length) {
                element.style.willChange = '';
                resolve();
                return;
            }

            if (stepIndex === 0) {
                element.style.willChange = 'transform';
            }

            const targetContainer = document.getElementById(path[stepIndex]);
            const initialPosition = element.getBoundingClientRect();
            const finalPosition = targetContainer.getBoundingClientRect();

            const offsetX = finalPosition.left - initialPosition.left;
            const offsetY = finalPosition.top - initialPosition.top;

            element.style.transform = `translate(${offsetX}px, ${offsetY}px)`;

            let settled = false;
            const settle = () => {
                if (settled) return;
                settled = true;
                clearTimeout(fallbackTimer);
                element.style.removeProperty("transform");
                targetContainer.appendChild(element);
                stepIndex++;
                requestAnimationFrame(step);
            };

            element.addEventListener('transitionend', settle, { once: true });
            const fallbackTimer = setTimeout(settle, 200);
        }

        requestAnimationFrame(step);
    });
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
    const mainMenu = document.getElementById("main-menu")
    const game = document.getElementById("game")
    mainMenu.style.transition = "opacity 0.3s ease"
    mainMenu.style.opacity = "0"
    setTimeout(() => {
        mainMenu.classList.add("hidden")
        mainMenu.style.removeProperty("opacity")
        mainMenu.style.removeProperty("transition")
        game.classList.remove("hidden")
        game.style.opacity = "0"
        game.style.transition = "opacity 0.3s ease"
        requestAnimationFrame(() => {
            game.style.opacity = "1"
            setTimeout(() => {
                game.style.removeProperty("opacity")
                game.style.removeProperty("transition")
            }, 300)
        })
    }, 300)
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