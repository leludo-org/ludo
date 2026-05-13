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

export function updateCellStacking(cell) {
    if (!cell) return;
    const tokens = Array.from(cell.querySelectorAll(':scope > wc-token'));
    const n = tokens.length;

    tokens.forEach(t => {
        t.style.removeProperty('position');
        t.style.removeProperty('width');
        t.style.removeProperty('height');
        t.style.removeProperty('top');
        t.style.removeProperty('left');
        t.style.removeProperty('right');
        t.style.removeProperty('bottom');
        t.style.removeProperty('z-index');
        t.style.removeProperty('display');
    });
    const badge = cell.querySelector('.stack-badge');
    if (badge) badge.remove();

    if (n <= 1) return;

    cell.style.position = 'relative';

    if (n === 2) {
        tokens[0].style.cssText += ';position:absolute;top:4%;left:4%;width:64%;height:64%;z-index:1;';
        tokens[1].style.cssText += ';position:absolute;bottom:4%;right:4%;width:64%;height:64%;z-index:2;';
    } else if (n === 3) {
        tokens[0].style.cssText += ';position:absolute;top:2%;left:50%;width:52%;height:52%;z-index:3;margin-left:-26%;';
        tokens[1].style.cssText += ';position:absolute;bottom:4%;left:0%;width:52%;height:52%;z-index:2;';
        tokens[2].style.cssText += ';position:absolute;bottom:4%;right:0%;width:52%;height:52%;z-index:2;';
    } else if (n === 4) {
        tokens[0].style.cssText += ';position:absolute;top:4%;left:4%;width:46%;height:46%;z-index:1;';
        tokens[1].style.cssText += ';position:absolute;top:4%;right:4%;width:46%;height:46%;z-index:1;';
        tokens[2].style.cssText += ';position:absolute;bottom:4%;left:4%;width:46%;height:46%;z-index:1;';
        tokens[3].style.cssText += ';position:absolute;bottom:4%;right:4%;width:46%;height:46%;z-index:1;';
    } else {
        tokens.forEach((t, i) => {
            if (i > 0) t.style.display = 'none';
        });
        tokens[0].style.cssText += ';position:absolute;inset:8%;width:84%;height:84%;z-index:1;';
        const badgeEl = document.createElement('div');
        badgeEl.className = 'stack-badge';
        badgeEl.textContent = `×${n}`;
        badgeEl.style.cssText = 'position:absolute;bottom:-6%;right:-6%;min-width:46%;height:46%;padding:0 4px;border-radius:50%;background:hsl(var(--foreground));color:hsl(var(--background));font-size:11px;font-weight:600;display:flex;align-items:center;justify-content:center;box-shadow:0 1px 3px rgba(0,0,0,0.3);z-index:3;';
        cell.appendChild(badgeEl);
    }
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
                element.style.position = '';
                element.style.zIndex = '';
                updateCellStacking(element.parentElement);
                resolve();
                return;
            }

            if (stepIndex === 0) {
                element.style.willChange = 'transform';
                element.style.position = 'relative';
                element.style.zIndex = '50';
            }

            playStepSound();
            const sourceCell = element.parentElement;
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
                updateCellStacking(sourceCell);
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

let turnCount = 0;

const PLAYER_NAMES = ['You', 'Bot 1', 'Bot 2', 'Bot 3'];

let _playerTypes = null;
let _getCurrentPlayerIndex = null;
let _getFinishedCount = null;
let _getIsLocalMultiplayer = null;

export function initRailDeps(pt, getCpi, getFC, getIsLMP) {
    _playerTypes = pt;
    _getCurrentPlayerIndex = getCpi;
    _getFinishedCount = getFC;
    _getIsLocalMultiplayer = getIsLMP;
}

// idx → { anchor, rot, layout }  TD = pill-then-dice, DT = dice-then-pill
const CORNER_CFG = [
    { anchor: 'b0', rot: 180, layout: 'TD' }, // top-left
    { anchor: 'b1', rot: 180, layout: 'DT' }, // top-right
    { anchor: 'b2', rot: 0,   layout: 'TD' }, // bottom-right
    { anchor: 'b3', rot: 0,   layout: 'DT' }, // bottom-left
];

function pillMarkup(idx, finished, active) {
    const dot = active
        ? `<div class="w-3 h-3 rounded-full bg-white"></div>`
        : `<div class="w-3 h-3 rounded-full bg-player-${idx}"></div>`;
    const cls = active
        ? `bg-player-${idx} text-white border-player-${idx}`
        : `bg-card text-foreground border-foreground/10`;
    const countCls = active
        ? `text-white/70 border-l border-white/25`
        : `opacity-50 border-l border-foreground/10`;
    return `
        <div class="flex items-center gap-2 rounded-full border ${cls} shadow-sm" style="padding:7px 11px;height:32px;box-sizing:border-box;">
            ${dot}
            <div class="text-[12px] font-medium leading-none">P${idx + 1}</div>
            <div class="text-[10px] font-mono leading-none ${countCls}" style="padding-left:6px;margin-left:2px;">${finished}/4</div>
        </div>`;
}

function restoreDiceToActionZone() {
    const dice = document.getElementById('wc-dice');
    const home = document.getElementById('dice-holder');
    if (dice && home && dice.parentElement !== home) {
        home.appendChild(dice);
        dice.style.cssText = '';
        dice.className = 'relative w-full';
    }
}

export function updateCornerWidgets() {
    if (!_playerTypes || !_getIsLocalMultiplayer) return;
    const isLMP = _getIsLocalMultiplayer();
    const pi = _getCurrentPlayerIndex();

    const railWrap = document.getElementById('player-rail-wrap');
    const actionWrap = document.getElementById('action-zone-wrap');
    const topRow = document.getElementById('corner-row-top');
    const botRow = document.getElementById('corner-row-bottom');

    if (!isLMP) {
        CORNER_CFG.forEach(({ anchor }) => {
            const el = document.getElementById(anchor);
            if (el) el.innerHTML = '';
        });
        if (topRow) { topRow.classList.add('hidden'); topRow.classList.remove('flex'); }
        if (botRow) { botRow.classList.add('hidden'); botRow.classList.remove('flex'); }
        if (railWrap) railWrap.classList.remove('hidden');
        if (actionWrap) actionWrap.classList.remove('hidden');
        restoreDiceToActionZone();
        return;
    }

    if (railWrap) railWrap.classList.add('hidden');
    if (actionWrap) actionWrap.classList.add('hidden');
    if (topRow) { topRow.classList.remove('hidden'); topRow.classList.add('flex'); }
    if (botRow) { botRow.classList.remove('hidden'); botRow.classList.add('flex'); }

    // Detach wc-dice before wiping any corner contents so we can reparent it.
    const dice = document.getElementById('wc-dice');
    if (dice && dice.parentElement) dice.parentElement.removeChild(dice);

    CORNER_CFG.forEach(({ anchor, rot, layout }, idx) => {
        const el = document.getElementById(anchor);
        if (!el) return;
        el.innerHTML = '';
        if (!_playerTypes[idx]) return;

        const isActive = idx === pi;
        const finished = _getFinishedCount(idx);

        const wrap = document.createElement('div');
        wrap.className = 'flex items-center gap-2';
        wrap.style.transform = `rotate(${rot}deg)`;

        const pill = document.createElement('div');
        pill.innerHTML = pillMarkup(idx, finished, isActive);
        const pillEl = pill.firstElementChild;

        const diceBtn = document.createElement('div');
        if (isActive) {
            diceBtn.className = `rounded-2xl flex items-center justify-center bg-player-${idx} active-dice-pulse`;
            diceBtn.style.cssText = 'width:56px;height:56px;padding:6px;box-sizing:border-box;--pulse-color:hsl(var(--player-' + idx + ') / 0.55);';
            if (dice) {
                dice.style.cssText = 'width:100%;height:100%;';
                dice.className = '';
                diceBtn.appendChild(dice);
            }
        } else {
            diceBtn.className = `rounded-2xl bg-player-${idx}`;
            diceBtn.style.cssText = 'width:56px;height:56px;box-sizing:border-box;opacity:0.4;';
        }

        if (layout === 'TD') {
            wrap.appendChild(pillEl);
            wrap.appendChild(diceBtn);
        } else {
            wrap.appendChild(diceBtn);
            wrap.appendChild(pillEl);
        }
        el.appendChild(wrap);
    });
}

export function updatePlayerRail() {
    const rail = document.getElementById('player-rail');
    if (!rail || !_playerTypes) return;
    const pi = _getCurrentPlayerIndex();

    rail.innerHTML = '';
    for (let i = 0; i < 4; i++) {
        if (!_playerTypes[i]) continue;
        const isActive = i === pi;
        const finished = _getFinishedCount(i);
        const name = _playerTypes[i] === 'PLAYER' ? 'You' : `Bot`;
        const slot = document.createElement('div');
        slot.className = `flex-1 flex flex-col items-center gap-0.5 py-1.5 px-1 rounded-[10px] relative transition-colors ${isActive ? 'bg-player-' + i + '-light' : ''}`;
        slot.innerHTML = `
            <div class="w-[22px] h-[22px] rounded-full bg-player-${i} flex items-center justify-center ${isActive ? 'ring-2 ring-player-' + i + ' ring-offset-2 ring-offset-card' : ''}">
                <div class="w-1.5 h-1.5 rounded-full bg-white/65"></div>
            </div>
            <div class="text-[11px] font-medium ${isActive ? '' : 'opacity-50'}">${name}</div>
            <div class="text-[10px] opacity-40 font-mono">${finished}/4</div>
            ${isActive ? '<div class="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-player-' + i + '"></div>' : ''}`;
        rail.appendChild(slot);
    }
}

export function updateActionZone(state, diceValue, playerIndex) {
    const zone = document.getElementById('action-zone');
    const textEl = document.getElementById('action-text');
    const holder = document.getElementById('dice-holder');
    if (!zone || !textEl) return;

    const pi = playerIndex ?? (_getCurrentPlayerIndex ? _getCurrentPlayerIndex() : 0);
    const isBot = _playerTypes ? _playerTypes[pi] === 'BOT' : false;
    const who = isBot ? 'Bot\'s turn' : 'Your turn';

    const colorClasses = ["text-player-0", "text-player-1", "text-player-2", "text-player-3"];
    if (holder) {
        colorClasses.forEach(c => holder.classList.remove(c));
        holder.classList.add(colorClasses[pi]);
    }

    const zoneBase = 'flex items-center gap-3.5 bg-card rounded-2xl p-3.5 px-4 border border-foreground/10';
    if (state === 'select') {
        zone.className = zoneBase;
        textEl.innerHTML = `
            <div class="text-[15px] font-medium">${isBot ? 'Bot' : 'You'} rolled a ${diceValue}</div>
            <div class="text-[13px] opacity-50 mt-0.5">${isBot ? 'Choosing move…' : 'Tap a glowing piece to move it.'}</div>`;
    } else if (state === 'rolling') {
        zone.className = zoneBase;
        textEl.innerHTML = `
            <div class="text-xs opacity-50 tracking-widest uppercase">${who}</div>
            <div class="text-[22px] font-display leading-tight mt-0.5 tracking-tight">Rolling…</div>`;
    } else {
        zone.className = zoneBase;
        textEl.innerHTML = `
            <div class="text-xs opacity-50 tracking-widest uppercase">${who}</div>
            <div class="text-[22px] font-display leading-tight mt-0.5 tracking-tight">${isBot ? 'Waiting…' : 'Tap to roll'}</div>`;
    }
}

export function updateTurnCounter() {
    turnCount++;
    const el = document.getElementById('turn-counter');
    if (el) el.textContent = `Turn ${turnCount}`;
}

export function resetTurnCount() {
    turnCount = 0;
}

export function moveDice(currentPlayerIndex) {
    updatePlayerRail();
    updateActionZone('idle', null, currentPlayerIndex);
    updateCornerWidgets();
}