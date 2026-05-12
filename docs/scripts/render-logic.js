import {getMarkIndex} from "./index.js";

export function playClickSound() {
    const ctx = getAudioCtx();
    const t = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.setValueAtTime(1200, t);
    osc.frequency.exponentialRampToValueAtTime(800, t + 0.04);
    gain.gain.setValueAtTime(0.06, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.05);
    osc.start(t);
    osc.stop(t + 0.05);
}

let audioCtx = null;
function getAudioCtx() {
    if (!audioCtx) audioCtx = new AudioContext();
    return audioCtx;
}

export function playStepSound() {
    const ctx = getAudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.value = 600;
    gain.gain.setValueAtTime(0.08, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.06);
    osc.start();
    osc.stop(ctx.currentTime + 0.06);
}

export function playCaptureSound() {
    const ctx = getAudioCtx();
    const t = ctx.currentTime;

    const sweep = ctx.createOscillator();
    const sweepGain = ctx.createGain();
    sweep.connect(sweepGain);
    sweepGain.connect(ctx.destination);
    sweep.frequency.setValueAtTime(800, t);
    sweep.frequency.exponentialRampToValueAtTime(200, t + 0.25);
    sweepGain.gain.setValueAtTime(0.15, t);
    sweepGain.gain.exponentialRampToValueAtTime(0.001, t + 0.3);
    sweep.start(t);
    sweep.stop(t + 0.3);

    const bufferSize = ctx.sampleRate * 0.15;
    const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
    const noise = ctx.createBufferSource();
    noise.buffer = noiseBuffer;
    const noiseGain = ctx.createGain();
    noise.connect(noiseGain);
    noiseGain.connect(ctx.destination);
    noiseGain.gain.setValueAtTime(0.12, t);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, t + 0.15);
    noise.start(t);
    noise.stop(t + 0.15);
}

export function playDiceSound() {
    const ctx = getAudioCtx();
    const t = ctx.currentTime;

    const bufferLen = Math.ceil(ctx.sampleRate * 0.06);
    const noiseBuffer = ctx.createBuffer(1, bufferLen, ctx.sampleRate);
    const data = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferLen; i++) data[i] = Math.random() * 2 - 1;

    const burstCount = 7 + Math.floor(Math.random() * 5);
    let offset = 0;
    let amp = 0.12;

    for (let i = 0; i < burstCount; i++) {
        const duration = 0.003 + Math.random() * 0.005;
        const startTime = t + offset;

        const noise = ctx.createBufferSource();
        noise.buffer = noiseBuffer;

        const lp = ctx.createBiquadFilter();
        lp.type = "lowpass";
        lp.frequency.setValueAtTime(3000 + Math.random() * 2000, startTime);
        lp.Q.setValueAtTime(0.1, startTime);

        const hp = ctx.createBiquadFilter();
        hp.type = "highpass";
        hp.frequency.setValueAtTime(300 + Math.random() * 200, startTime);
        hp.Q.setValueAtTime(0.1, startTime);

        const gain = ctx.createGain();
        gain.gain.setValueAtTime(amp, startTime);
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);

        noise.connect(hp);
        hp.connect(lp);
        lp.connect(gain);
        gain.connect(ctx.destination);

        noise.start(startTime);
        noise.stop(startTime + duration);

        offset += 0.01 + Math.random() * 0.025;
        amp *= 0.7 + Math.random() * 0.15;
    }
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
    playDiceSound();

    const diceContainer = document.getElementById("dice");
    diceContainer.classList.add("dice-rolling");
    diceContainer.addEventListener("animationend", () => {
        diceContainer.classList.remove("dice-rolling");
    }, { once: true });

    return new Promise(resolve => {
        let diceRoll = currentDiceRoll
        let counter = 0;
        const delays = [40, 40, 40, 50, 60, 80, 100, 140];
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

            playStepSound();
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
            const fallbackTimer = setTimeout(settle, 400);
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
    document.getElementById("wc-dice").dataset.active = "true"
}

export function inactiveDice() {
    document.getElementById("wc-dice").dataset.active = "false"
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
}

/**
 *
 * @param {number} currentPlayerIndex
 */
export function applyColorMap(colorMap) {
    const root = document.documentElement
    colorMap.forEach((originalColor, position) => {
        root.style.setProperty(`--player-${position}`, `var(--base-color-${originalColor})`)
        root.style.setProperty(`--player-${position}-light`, `var(--base-color-${originalColor}-light)`)
    })
}

export function moveDice(currentPlayerIndex) {
    const targetContainer = document.getElementById(`b${currentPlayerIndex}`)
    const holder = document.getElementById("dice-holder")
    targetContainer.appendChild(holder)
    const colorClasses = ["text-player-0", "text-player-1", "text-player-2", "text-player-3"]
    colorClasses.forEach(c => holder.classList.remove(c))
    holder.classList.add(colorClasses[currentPlayerIndex])
}