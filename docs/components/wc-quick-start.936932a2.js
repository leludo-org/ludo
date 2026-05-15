import {
    htmlToElement,
    VERSION,
} from "./index.bf0b1971.js";
import {handleGameStart, handleGameResume, playClickSound} from "../scripts/index.e8f102de.js";
import {randomBotName, isDefaultBotName, getSavedSeatName, setSavedSeatName} from "../scripts/bot-names.bc6124a2.js";

const COLOR_NAMES = ["Vermillion", "Emerald", "Saffron", "Cobalt"];
const COLOR_KEYS = ["red", "green", "yellow", "blue"];

const DICE_SVG = (value, size = 56) => {
    const PIP_LAYOUTS = {
        1: [[1,1]],
        2: [[0,0],[2,2]],
        3: [[0,0],[1,1],[2,2]],
        4: [[0,0],[0,2],[2,0],[2,2]],
        5: [[0,0],[0,2],[1,1],[2,0],[2,2]],
        6: [[0,0],[0,2],[1,0],[1,2],[2,0],[2,2]],
    };
    const pad = size * 0.18;
    const pip = size * 0.12;
    const cell = (size - pad * 2) / 2;
    const pips = PIP_LAYOUTS[value] || PIP_LAYOUTS[1];
    const pipSvgs = pips.map(([gr, gc]) =>
        `<circle cx="${pad + gc * cell}" cy="${pad + gr * cell}" r="${pip/2}" fill="hsl(var(--foreground))"/>`
    ).join('');
    return `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
        <rect width="${size}" height="${size}" rx="${size * 0.22}" fill="hsl(var(--card))" stroke="hsl(var(--border))" stroke-width="1"/>
        ${pipSvgs}
    </svg>`;
};

const PAWN_SVG = (playerIndex) => `
    <svg viewBox="0 0 32 32" class="text-player-${playerIndex}" style="width:100%;height:100%;filter:drop-shadow(0 1.2px 1.5px rgba(0,0,0,0.28));">
        <ellipse cx="16" cy="28" rx="8" ry="1.5" fill="rgba(0,0,0,0.18)"/>
        <path d="M16 4c3.2 0 5.5 2.4 5.5 5.2 0 1.8-1 3.2-2.4 4 1.7.7 2.9 1.8 3.6 3.4l1.1 2.6c.4 1 .1 2-.7 2.4-.2.1-.4.1-.6.1H9.5c-.9 0-1.6-.7-1.6-1.6 0-.3.1-.6.2-.9l1.1-2.6c.7-1.6 1.9-2.7 3.6-3.4-1.4-.8-2.4-2.2-2.4-4C10.4 6.4 12.8 4 16 4z" fill="currentColor"/>
        <path d="M16 4c3.2 0 5.5 2.4 5.5 5.2 0 1.8-1 3.2-2.4 4-.6-.3-1.3-.5-2-.5h-2.2c-.7 0-1.4.2-2 .5-1.4-.8-2.4-2.2-2.4-4C10.4 6.4 12.8 4 16 4z" fill="rgba(255,255,255,0.24)"/>
        <rect x="7.5" y="22" width="17" height="3.5" rx="1.4" fill="currentColor"/>
        <rect x="7.5" y="22" width="17" height="1.2" rx="0.6" fill="rgba(255,255,255,0.38)"/>
    </svg>`;

const ICON_GEAR = `<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M12 15.5a3.5 3.5 0 100-7 3.5 3.5 0 000 7zM19.4 13.5a7.6 7.6 0 000-3l2-1.6-2-3.5-2.4.8a7.5 7.5 0 00-2.6-1.5l-.4-2.5h-4l-.4 2.5a7.5 7.5 0 00-2.6 1.5l-2.4-.8-2 3.5 2 1.6a7.6 7.6 0 000 3l-2 1.6 2 3.5 2.4-.8a7.5 7.5 0 002.6 1.5l.4 2.5h4l.4-2.5a7.5 7.5 0 002.6-1.5l2.4.8 2-3.5-2-1.6z"/></svg>`;
const ICON_GITHUB = `<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2a10 10 0 00-3.2 19.5c.5.1.7-.2.7-.5v-1.7c-2.8.6-3.4-1.3-3.4-1.3-.5-1.2-1.1-1.5-1.1-1.5-.9-.6.1-.6.1-.6 1 .1 1.5 1 1.5 1 .9 1.6 2.4 1.1 3 .9.1-.7.4-1.1.6-1.4-2.2-.3-4.6-1.1-4.6-5 0-1.1.4-2 1-2.7-.1-.3-.4-1.3.1-2.7 0 0 .8-.3 2.7 1a9.5 9.5 0 015 0c1.9-1.3 2.7-1 2.7-1 .5 1.4.2 2.4.1 2.7.6.7 1 1.6 1 2.7 0 3.9-2.4 4.7-4.6 5 .4.3.7.9.7 1.8v2.6c0 .3.2.6.7.5A10 10 0 0012 2z"/></svg>`;
const ICON_FORWARD = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M9 6l6 6-6 6"/></svg>`;
const ICON_BACK = `<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M15 18l-6-6 6-6"/></svg>`;
const ICON_CLOSE = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M6 6l12 12M18 6L6 18"/></svg>`;
const ICON_PLUS = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 5v14M5 12h14"/></svg>`;
const ICON_USER = `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M12 12a4 4 0 100-8 4 4 0 000 8zM4 21a8 8 0 0116 0"/></svg>`;
const ICON_BOT = `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2v3M8 7h8a3 3 0 013 3v7a3 3 0 01-3 3H8a3 3 0 01-3-3v-7a3 3 0 013-3zM9 13h.01M15 13h.01M9 17h6"/></svg>`;
const ICON_PENCIL = `<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9M16.5 3.5a2.121 2.121 0 113 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>`;

const CIRCLE_BTN = "w-[38px] h-[38px] rounded-full bg-transparent border border-foreground/15 flex items-center justify-center cursor-pointer opacity-70 hover:opacity-100 transition-opacity";

class QuickStart extends HTMLElement {
    constructor() {
        super();
        const slots = [
            { type: 'PLAYER', colorIndex: 0 },
            { type: 'BOT', colorIndex: 1 },
            { type: 'BOT', colorIndex: 2 },
            { type: 'BOT', colorIndex: 3 },
        ];
        const botNames = [];
        this.seats = slots.map((slot, i) => {
            const saved = getSavedSeatName(slot.type, i);
            let name;
            if (slot.type === 'PLAYER') {
                name = saved || `Player ${i + 1}`;
            } else if (saved && !botNames.includes(saved)) {
                name = saved;
                botNames.push(name);
            } else {
                name = randomBotName(botNames);
                botNames.push(name);
            }
            return { active: true, type: slot.type, colorIndex: slot.colorIndex, name };
        });
        this._focusedSeatIndex = null;
    }

    _defaultName(seat, seatIndex) {
        const saved = getSavedSeatName(seat.type, seatIndex)
        if (seat.type !== 'BOT') return saved || `Player ${seatIndex + 1}`
        const used = this.seats.filter(s => s !== seat && s.active && s.type === 'BOT').map(s => s.name)
        if (saved && !used.includes(saved)) return saved
        return randomBotName(used)
    }

    _applyFocusUI() {
        const focused = this._focusedSeatIndex
        this.querySelectorAll('.seat-row').forEach(row => {
            const idx = +row.dataset.seatIdx
            row.style.opacity = (focused !== null && focused !== idx) ? '0.35' : ''
        })
        const helper = this.querySelector('#setup-helper')
        if (helper) helper.innerHTML = focused !== null ? helper.dataset.edit : helper.dataset.default
    }

    connectedCallback() {
        this.showHomeScreen()
        document.addEventListener("bot-name-pool-changed", () => this._reshuffleBotNames())
    }

    _reshuffleBotNames() {
        const used = []
        this.seats.forEach((seat, idx) => {
            if (!seat.active || seat.type !== 'BOT') return
            if (getSavedSeatName('BOT', idx)) return
            if (!isDefaultBotName(seat.name)) return
            seat.name = randomBotName(used)
            used.push(seat.name)
        })
        if (this.querySelector('#seat-list')) this._renderSeats()
    }

    showHomeScreen() {
        this.innerHTML = ""

        const savedGame = localStorage.getItem('ludo-save')
        const resumeCard = savedGame ? `
            <div class="resume-card bg-card rounded-2xl p-3.5 px-4 border border-foreground/10 flex items-center gap-3.5 cursor-pointer hover:bg-card-hover transition-colors">
                <div class="flex relative" style="width:60px;">
                    ${[0,1,2,3].map((c, i) => `
                        <div class="absolute rounded-full border-2 border-card" style="left:${i*12}px;width:22px;height:22px;background:hsl(var(--player-${c}));"></div>
                    `).join('')}
                </div>
                <div class="flex-1">
                    <div class="text-xs opacity-50 tracking-wider uppercase">Resume</div>
                    <div class="text-sm font-medium mt-0.5">Saved game</div>
                </div>
                ${ICON_FORWARD}
            </div>` : ''

        const html = /*html*/ `
            <div class="flex flex-col h-full min-h-[calc(100dvh-16px)]">
                <div class="flex items-center gap-2 pt-1 pb-6">
                    <a href="https://github.com/leludo-org/ludo" target="_blank" rel="noopener" class="${CIRCLE_BTN} text-foreground no-underline">${ICON_GITHUB}</a>
                    <div class="flex-1 text-center text-[11px] font-medium tracking-[0.16em] uppercase opacity-50">v${VERSION}</div>
                    <wc-settings></wc-settings>
                </div>
                <div class="flex-1 flex flex-col justify-center px-2">
                    <div class="flex items-end gap-3 mb-6">
                        ${DICE_SVG(4, 48)}
                        ${DICE_SVG(6, 48)}
                    </div>
                    <h1 class="font-display leading-[0.85] tracking-tight" style="font-size: clamp(64px, 18vw, 88px);">
                        le<br>ludo.
                    </h1>
                    <p class="mt-4 text-base opacity-50 max-w-[280px] leading-relaxed">
                        A quiet, faithful take on the classic four-player race. Pass &amp; play, or run the table against bots.
                    </p>
                </div>

                ${resumeCard ? `<div class="px-0 pb-3">${resumeCard}</div>` : ''}

                <div class="pb-2">
                    <button class="new-game-btn w-full h-[60px] rounded-2xl bg-foreground text-background font-medium text-[17px] tracking-wide border-none cursor-pointer flex items-center justify-center gap-2.5 hover:opacity-90 transition-opacity"
                        style="box-shadow: 0 8px 22px -8px rgba(31,27,20,0.4);">
                        New game
                        ${ICON_FORWARD}
                    </button>
                </div>
            </div>
        `

        const el = htmlToElement(html)

        el.querySelector(".new-game-btn").addEventListener("click", () => {
            playClickSound()
            this.showSetupScreen()
        })

        const resumeEl = el.querySelector(".resume-card")
        if (resumeEl) {
            resumeEl.addEventListener("click", () => {
                playClickSound()
                handleGameResume()
            })
        }

        this.appendChild(el)
    }

    showSetupScreen() {
        this.innerHTML = ""

        const html = /*html*/ `
            <style>
                .seat-name { outline: none !important; box-shadow: none !important; -webkit-tap-highlight-color: transparent; color: hsl(var(--foreground)); }
                .seat-name:focus, .seat-name:focus-visible { outline: none !important; box-shadow: none !important; }
                .seat-name::selection { background: hsl(var(--foreground) / 0.12); color: inherit; }
                .seat-name-pencil.hide-on-focus { display: none; }
                .seat-row { flex-wrap: nowrap; }
                .seat-pill { display: inline-flex; flex-wrap: nowrap; }
            </style>
            <div class="flex flex-col min-h-[calc(100dvh-16px)]">
                <div class="flex items-center gap-2 pt-1 pb-6">
                    <button class="back-btn ${CIRCLE_BTN}">${ICON_BACK}</button>
                    <div class="flex-1 text-center text-xs font-medium tracking-[0.16em] uppercase opacity-50">Setup</div>
                    <div class="w-[38px]"></div>
                </div>

                <h2 class="font-display text-[40px] leading-none tracking-tight px-1 pt-2">
                    Who&rsquo;s<br>playing?
                </h2>
                <p id="setup-helper" data-default="Each seat is either a person on this phone or a bot. Tap the pill to switch." data-edit="Rename your seat. Tap return when you&rsquo;re done." class="text-sm opacity-50 px-1 pt-2 pb-4 max-w-[320px]">Each seat is either a person on this phone or a bot. Tap the pill to switch.</p>

                <div id="seat-list" class="flex flex-col gap-2.5"></div>

                <div class="flex-1"></div>

                <div class="pt-4 pb-2">
                    <button class="start-btn w-full h-[60px] rounded-2xl bg-foreground text-background font-medium text-[17px] tracking-wide border-none cursor-pointer flex items-center justify-center gap-2.5 hover:opacity-90 transition-opacity">
                        Start game
                        ${ICON_FORWARD}
                    </button>
                </div>
            </div>
        `

        const el = htmlToElement(html)

        el.querySelector(".back-btn").addEventListener("click", () => {
            playClickSound()
            this.showHomeScreen()
        })

        el.querySelector(".start-btn").addEventListener("click", () => {
            playClickSound()
            this._startGame()
        })

        this.appendChild(el)
        this._renderSeats()
    }

    _renderSeats() {
        const container = this.querySelector("#seat-list")
        if (!container) return
        container.innerHTML = ""

        this.seats.forEach((seat, i) => {
            const filled = seat.active
            const usedColors = this.seats.filter((s, j) => s.active && j !== i).map(s => s.colorIndex)

            if (filled) {
                const isPlayer = seat.type === 'PLAYER'
                const NAME_MAX = 9
                if (!seat.name) seat.name = this._defaultName(seat, i)
                const colorName = COLOR_NAMES[seat.colorIndex]
                const colorVar = `hsl(var(--player-${seat.colorIndex}))`
                const playerActiveStyle = isPlayer ? `style="background:${colorVar};color:#fff;"` : ''
                const botActiveStyle = !isPlayer ? `style="background:${colorVar};color:#fff;"` : ''
                const inactiveCls = "bg-transparent opacity-55 hover:opacity-90"
                const dimmed = this._focusedSeatIndex !== null && this._focusedSeatIndex !== i
                const rowDimStyle = dimmed ? 'opacity:0.35;' : ''
                const charLen = (seat.name || '').length
                const seatHtml = /*html*/ `
                    <div class="seat-row bg-card rounded-2xl p-3 px-3.5 flex items-center gap-3 border border-foreground/10 transition-opacity" data-seat-idx="${i}" style="${rowDimStyle}">
                        <button class="color-cycle w-11 h-11 rounded-xl flex items-center justify-center shrink-0 border-none cursor-pointer p-0" style="background:${colorVar};" title="Change color">
                            <div class="w-[78%] h-[78%]">${PAWN_SVG(seat.colorIndex)}</div>
                        </button>
                        <div class="flex-1 min-w-0">
                            <label class="seat-name-wrap group flex w-full items-center gap-2 cursor-text min-w-0" style="border-bottom:1px solid hsl(var(--foreground)/0.12);transition:border-color 0.15s, border-width 0.15s;padding-bottom:2px;">
                                <input class="seat-name flex-1 w-full bg-transparent border-none outline-none text-[15px] font-medium truncate p-0 m-0 min-w-0 appearance-none" type="text" name="ludo-seat-${i}" autocomplete="off" autocorrect="off" autocapitalize="words" data-form-type="other" data-lpignore="true" data-1p-ignore="true" style="caret-color:${colorVar};background:transparent;" value="${(seat.name || '').replace(/"/g, '&quot;')}" maxlength="${NAME_MAX}" spellcheck="false" />
                                <span class="seat-name-pencil opacity-30 group-hover:opacity-70 transition-opacity shrink-0" style="line-height:0;">${ICON_PENCIL}</span>
                                <span class="seat-char-count text-[11px] font-mono hidden shrink-0" style="color:${colorVar};">${charLen}/${NAME_MAX}</span>
                            </label>
                        </div>
                        <div class="seat-pill inline-flex rounded-full bg-foreground/5 p-[3px] text-[12px] font-medium shrink-0" style="border:1px solid hsl(var(--foreground)/0.08);">
                            <button data-half="PLAYER" class="seat-half inline-flex items-center gap-1 px-2.5 py-1 rounded-full border-none cursor-pointer transition-colors ${isPlayer ? '' : inactiveCls}" ${playerActiveStyle}>${ICON_USER}<span>Human</span></button>
                            <button data-half="BOT" class="seat-half inline-flex items-center gap-1 px-2.5 py-1 rounded-full border-none cursor-pointer transition-colors ${!isPlayer ? '' : inactiveCls}" ${botActiveStyle}>${ICON_BOT}<span>Bot</span></button>
                        </div>
                        <button class="remove-seat cursor-pointer bg-transparent border-none p-1 opacity-30 hover:opacity-60 transition-opacity shrink-0">${ICON_CLOSE}</button>
                    </div>`
                const seatEl = htmlToElement(seatHtml)

                seatEl.querySelectorAll(".seat-half").forEach(btn => {
                    btn.addEventListener("click", () => {
                        const target = btn.dataset.half
                        if (target === seat.type) return
                        playClickSound()
                        seat.type = target
                        seat.name = this._defaultName({ ...seat, type: target }, i)
                        this._renderSeats()
                    })
                })

                const nameInput = seatEl.querySelector(".seat-name")
                const nameWrap = seatEl.querySelector(".seat-name-wrap")
                const charCount = seatEl.querySelector(".seat-char-count")
                const pencil = seatEl.querySelector(".seat-name-pencil")
                if (nameInput) {
                    const updateCount = () => {
                        if (charCount) charCount.textContent = `${(nameInput.value || '').length}/${nameInput.maxLength}`
                    }
                    nameInput.addEventListener("input", () => {
                        seat.name = nameInput.value
                        seat._edited = true
                        updateCount()
                    })
                    nameInput.addEventListener("focus", () => {
                        this._focusedSeatIndex = i
                        if (nameWrap) {
                            nameWrap.style.borderBottomColor = colorVar
                            nameWrap.style.borderBottomWidth = '1.5px'
                        }
                        if (charCount) charCount.classList.remove("hidden")
                        if (pencil) pencil.classList.add("hide-on-focus")
                        this._applyFocusUI()
                        const len = nameInput.value.length
                        nameInput.setSelectionRange(len, len)
                    })
                    nameInput.addEventListener("keydown", (e) => {
                        if (e.key === "Enter") { e.preventDefault(); nameInput.blur(); }
                    })
                    nameInput.addEventListener("blur", () => {
                        const trimmed = (nameInput.value || '').trim()
                        if (seat._edited) {
                            setSavedSeatName(seat.type, i, trimmed)
                        }
                        seat.name = trimmed || this._defaultName(seat, i)
                        seat._edited = false
                        nameInput.value = seat.name
                        if (nameWrap) {
                            nameWrap.style.borderBottomColor = ''
                            nameWrap.style.borderBottomWidth = ''
                        }
                        if (charCount) charCount.classList.add("hidden")
                        if (pencil) pencil.classList.remove("hide-on-focus")
                        this._focusedSeatIndex = null
                        this._applyFocusUI()
                    })
                }

                seatEl.querySelector(".color-cycle").addEventListener("click", () => {
                    playClickSound()
                    let next = (seat.colorIndex + 1) % 4
                    while (usedColors.includes(next)) next = (next + 1) % 4
                    seat.colorIndex = next
                    this._renderSeats()
                })

                seatEl.querySelector(".remove-seat").addEventListener("click", () => {
                    playClickSound()
                    seat.active = false
                    seat.colorIndex = null
                    this._renderSeats()
                })

                container.appendChild(seatEl)
            } else {
                const emptyHtml = /*html*/ `
                    <div class="seat-row-empty bg-card/40 rounded-2xl p-3 px-3.5 flex items-center gap-3 border border-dashed border-foreground/15">
                        <div class="w-11 h-11 rounded-xl border-2 border-dashed border-foreground/20 shrink-0"></div>
                        <div class="flex-1 min-w-0">
                            <div class="text-[15px] font-medium opacity-60 truncate">Empty seat</div>
                            <div class="text-xs opacity-50 mt-0.5 truncate">Tap a side to fill</div>
                        </div>
                        <div class="seat-pill inline-flex rounded-full bg-foreground/5 p-[3px] text-[12px] font-medium shrink-0" style="border:1px solid hsl(var(--foreground)/0.08);">
                            <button data-add="PLAYER" class="seat-add inline-flex items-center gap-1 px-2.5 py-1 rounded-full border-none cursor-pointer bg-transparent opacity-55 hover:opacity-100 transition-opacity">${ICON_USER}<span>Human</span></button>
                            <button data-add="BOT" class="seat-add inline-flex items-center gap-1 px-2.5 py-1 rounded-full border-none cursor-pointer bg-transparent opacity-55 hover:opacity-100 transition-opacity">${ICON_BOT}<span>Bot</span></button>
                        </div>
                    </div>`
                const emptyEl = htmlToElement(emptyHtml)
                emptyEl.querySelectorAll(".seat-add").forEach(btn => {
                    btn.addEventListener("click", () => {
                        playClickSound()
                        const usedAll = this.seats.filter(s => s.active).map(s => s.colorIndex)
                        const freeColor = [0,1,2,3].find(c => !usedAll.includes(c))
                        if (freeColor === undefined) return
                        const target = btn.dataset.add
                        seat.active = true
                        seat.type = target
                        seat.colorIndex = freeColor
                        seat.name = this._defaultName({ ...seat, type: target, colorIndex: freeColor }, i)
                        this._renderSeats()
                    })
                })
                container.appendChild(emptyEl)
            }
        })

        // Ensure at least 2 active players for start button
        const activeCount = this.seats.filter(s => s.active).length
        const startBtn = this.querySelector(".start-btn")
        if (startBtn) {
            startBtn.disabled = activeCount < 2
            startBtn.style.opacity = activeCount < 2 ? '0.4' : '1'
            startBtn.style.cursor = activeCount < 2 ? 'not-allowed' : 'pointer'
        }
    }

    _startGame() {
        const activeSeats = this.seats.filter(s => s.active)
        if (activeSeats.length < 2) return

        const humans = activeSeats.filter(s => s.type === 'PLAYER')
        const bots = activeSeats.filter(s => s.type === 'BOT')
        const humanCount = humans.length
        const botCount = bots.length
        const humanColors = humans.map(s => s.colorIndex)

        const namesByPlayerIndex = new Array(4).fill('')
        if (humanCount === 4) {
            humans.forEach((s, idx) => { namesByPlayerIndex[idx] = s.name })
        } else {
            const preferredPositions = [2, 0, 1, 3]
            const usedPositions = new Set()
            humans.forEach((s, idx) => {
                const pos = preferredPositions[idx]
                namesByPlayerIndex[pos] = s.name
                usedPositions.add(pos)
            })
            let botIdx = 0
            for (let pos = 0; pos < 4 && botIdx < botCount; pos++) {
                if (!usedPositions.has(pos)) {
                    namesByPlayerIndex[pos] = bots[botIdx].name
                    botIdx++
                }
            }
        }

        const quickStartId = `qs,${humanCount},${botCount},${humanColors.join(",")}`
        handleGameStart(quickStartId, namesByPlayerIndex)
    }

    // Keep old methods for compatibility
    showPlayerCount() { this.showHomeScreen() }
    showBotCount() { this.showHomeScreen() }
    showColorPicker() { this.showHomeScreen() }
}

const PLAYER_COLORS_MAP = {
    0: { name: 'Vermillion', key: 'red' },
    1: { name: 'Emerald', key: 'green' },
    2: { name: 'Saffron', key: 'yellow' },
    3: { name: 'Cobalt', key: 'blue' },
};

window.customElements.define("wc-quick-start", QuickStart)
