import {
    htmlToElement
} from "./index.js";
import {handleGameStart, handleGameResume, playClickSound} from "../scripts/index.js";

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

const CIRCLE_BTN = "w-[38px] h-[38px] rounded-full bg-transparent border border-foreground/15 flex items-center justify-center cursor-pointer opacity-70 hover:opacity-100 transition-opacity";

class QuickStart extends HTMLElement {
    constructor() {
        super();
        this.seats = [
            { active: true, type: 'PLAYER', colorIndex: 0, name: 'Player 1' },
            { active: true, type: 'PLAYER', colorIndex: 1, name: 'Player 2' },
            { active: true, type: 'PLAYER', colorIndex: 2, name: 'Player 3' },
            { active: true, type: 'PLAYER', colorIndex: 3, name: 'Player 4' },
        ];
    }

    connectedCallback() {
        this.showHomeScreen()
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
            <div class="flex flex-col h-full min-h-[70vh]">
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
            <div class="flex flex-col min-h-[70vh]">
                <div class="flex items-center gap-2 pb-8">
                    <button class="back-btn ${CIRCLE_BTN}">${ICON_BACK}</button>
                    <div class="flex-1 text-center text-xs font-medium tracking-[0.16em] uppercase opacity-50">Setup</div>
                    <div class="w-[38px]"></div>
                </div>

                <h2 class="font-display text-[40px] leading-none tracking-tight px-1 pt-2">
                    Who&rsquo;s<br>playing?
                </h2>
                <p class="text-sm opacity-50 px-1 pt-2 pb-4">Tap a seat to fill it. Tap type to toggle human/bot.</p>

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
                const color = PLAYER_COLORS_MAP[seat.colorIndex]
                const seatHtml = /*html*/ `
                    <div class="seat-row bg-card rounded-2xl p-3 px-3.5 flex items-center gap-3.5 border border-foreground/10">
                        <div class="w-11 h-11 rounded-xl flex items-center justify-center" style="background:hsl(var(--player-${seat.colorIndex}));">
                            <div class="w-[78%] h-[78%]">${PAWN_SVG(seat.colorIndex)}</div>
                        </div>
                        <div class="flex-1 min-w-0">
                            <div class="text-base font-medium">${seat.name}</div>
                            <div class="text-xs opacity-50 mt-0.5 flex items-center gap-1.5">
                                <button class="type-toggle inline-flex items-center gap-1 cursor-pointer bg-transparent border-none p-0 opacity-70 hover:opacity-100 transition-opacity">
                                    ${seat.type === 'BOT' ? ICON_BOT : ICON_USER}
                                    <span>${seat.type === 'BOT' ? 'Bot' : 'Human'}</span>
                                </button>
                                <span class="opacity-40">&middot;</span>
                                <button class="color-cycle cursor-pointer bg-transparent border-none p-0 font-medium transition-opacity hover:opacity-100" style="color:hsl(var(--player-${seat.colorIndex}));">${COLOR_NAMES[seat.colorIndex]}</button>
                            </div>
                        </div>
                        <button class="remove-seat cursor-pointer bg-transparent border-none p-1 opacity-30 hover:opacity-60 transition-opacity">${ICON_CLOSE}</button>
                    </div>`
                const seatEl = htmlToElement(seatHtml)

                seatEl.querySelector(".type-toggle").addEventListener("click", () => {
                    playClickSound()
                    seat.type = seat.type === 'BOT' ? 'PLAYER' : 'BOT'
                    seat.name = seat.type === 'BOT' ? `Bot ${i + 1}` : `Player ${i + 1}`
                    this._renderSeats()
                })

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
                    <div class="seat-row-empty bg-card rounded-2xl p-3 px-3.5 flex items-center gap-3.5 border border-dashed border-foreground/15 opacity-55 cursor-pointer hover:opacity-75 transition-opacity">
                        <div class="w-11 h-11 rounded-xl border-2 border-dashed border-foreground/20 flex items-center justify-center"></div>
                        <div class="flex-1">
                            <div class="text-base font-medium">Empty seat</div>
                            <div class="text-xs opacity-50 mt-0.5">Tap to add</div>
                        </div>
                        <span class="opacity-40">${ICON_PLUS}</span>
                    </div>`
                const emptyEl = htmlToElement(emptyHtml)
                emptyEl.querySelector(".seat-row-empty").addEventListener("click", () => {
                    playClickSound()
                    const usedAll = this.seats.filter(s => s.active).map(s => s.colorIndex)
                    const freeColor = [0,1,2,3].find(c => !usedAll.includes(c))
                    if (freeColor === undefined) return
                    seat.active = true
                    seat.type = 'BOT'
                    seat.colorIndex = freeColor
                    seat.name = `Bot ${i + 1}`
                    this._renderSeats()
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

        const humanCount = activeSeats.filter(s => s.type === 'PLAYER').length
        const botCount = activeSeats.filter(s => s.type === 'BOT').length
        const humanColors = activeSeats.filter(s => s.type === 'PLAYER').map(s => s.colorIndex)

        const quickStartId = `qs,${humanCount},${botCount},${humanColors.join(",")}`
        handleGameStart(quickStartId)
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
