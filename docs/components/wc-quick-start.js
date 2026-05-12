import {
    htmlToElement
} from "./index.js";
import {handleGameStart, playClickSound} from "../scripts/index.js";

const COLOR_NAMES = ["Red", "Green", "Yellow", "Blue"];

const BTN_CLASS = "flex flex-col items-center gap-2 rounded-xl p-5 bg-card shadow-md hover:shadow-xl hover:scale-[1.03] transition-all duration-200 cursor-pointer border border-border/30 hover:border-foreground/15"

class QuickStart extends HTMLElement {
    constructor() {
        super();
    }

    connectedCallback() {
        this.showPlayerCount()
    }

    showPlayerCount() {
        this.innerHTML = ""

        const html = /*html*/ `
            <div class="flex flex-col gap-6 max-w-sm mx-auto items-center">
                <p class="text-center text-xs font-medium tracking-widest uppercase opacity-50">How Many Players?</p>
                <div class="grid grid-cols-2 gap-3 w-full">
                    ${[1, 2, 3, 4].map(n => `
                        <button data-count="${n}" class="player-count ${BTN_CLASS}"
                            style="border-top: 3px solid hsl(var(--player-${n - 1}));">
                            <span class="text-3xl font-bold">${n}</span>
                            <span class="text-xs opacity-50 tracking-wider uppercase">${n === 1 ? "Player" : "Players"}</span>
                        </button>
                    `).join("")}
                </div>
            </div>
        `

        const el = htmlToElement(html)

        el.querySelectorAll(".player-count").forEach(btn => {
            btn.addEventListener("click", () => {
                playClickSound()
                const humanCount = +btn.dataset.count
                this.showBotCount(humanCount)
            })
        })

        this.appendChild(el)
    }

    showBotCount(humanCount) {
        const maxBots = 4 - humanCount

        if (maxBots === 0) {
            handleGameStart(`qs,4,0`)
            return
        }


        this.innerHTML = ""

        const minBots = humanCount < 2 ? 1 : 0
        const options = []
        for (let i = minBots; i <= maxBots; i++) options.push(i)

        const html = /*html*/ `
            <div class="flex flex-col gap-6 max-w-sm mx-auto items-center">
                <p class="text-center text-xs font-medium tracking-widest uppercase opacity-50">How Many Bots?</p>
                <div class="grid grid-cols-2 gap-3 w-full">
                    ${options.map(n => `
                        <button data-bots="${n}" class="bot-count ${BTN_CLASS}">
                            <span class="text-3xl font-bold">${n}</span>
                            <span class="text-xs opacity-50 tracking-wider uppercase">${n === 1 ? "Bot" : n === 0 ? "No Bots" : "Bots"}</span>
                        </button>
                    `).join("")}
                </div>
                <button class="back-btn text-xs opacity-40 hover:opacity-70 cursor-pointer tracking-widest uppercase transition-opacity">Back</button>
            </div>
        `

        const el = htmlToElement(html)

        el.querySelector(".back-btn").addEventListener("click", () => {
            playClickSound()
            this.showPlayerCount()
        })

        el.querySelectorAll(".bot-count").forEach(btn => {
            btn.addEventListener("click", () => {
                playClickSound()
                const botCount = +btn.dataset.bots
                this.showColorPicker(humanCount, botCount)
            })
        })

        this.appendChild(el)
    }

    showColorPicker(humanCount, botCount, chosenColors = []) {
        const playerNum = chosenColors.length + 1
        const label = humanCount === 1
            ? "Pick Your Color"
            : `Player ${playerNum} — Pick Your Color`

        this.innerHTML = ""

        const pickerHTML = /*html*/ `
            <div class="flex flex-col gap-6 max-w-sm mx-auto items-center">
                <p class="text-center text-xs font-medium tracking-widest uppercase opacity-50">${label}</p>
                <div class="flex gap-4">
                    ${[0, 1, 2, 3].map(i => {
                        const taken = chosenColors.includes(i)
                        return `<button data-color="${i}"
                            class="color-pick size-16 rounded-full bg-player-${i} transition-all duration-200 ${taken ? "opacity-20 cursor-not-allowed scale-75" : "cursor-pointer hover:scale-110 hover:shadow-lg"}"
                            ${taken ? "disabled" : ""}
                            title="${COLOR_NAMES[i]}">
                        </button>`
                    }).join("")}
                </div>
                <button class="back-btn text-xs opacity-40 hover:opacity-70 cursor-pointer tracking-widest uppercase transition-opacity">Back</button>
            </div>
        `

        const pickerEl = htmlToElement(pickerHTML)

        pickerEl.querySelector(".back-btn").addEventListener("click", () => {
            playClickSound()
            this.showBotCount(humanCount)
        })

        pickerEl.querySelectorAll(".color-pick:not([disabled])").forEach(btn => {
            btn.addEventListener("click", () => {
                playClickSound()
                const colorIndex = +btn.dataset.color
                const newChosen = [...chosenColors, colorIndex]

                if (newChosen.length < humanCount) {
                    this.showColorPicker(humanCount, botCount, newChosen)
                } else {
                    const quickStartId = `qs,${humanCount},${botCount},${newChosen.join(",")}`
                    handleGameStart(quickStartId)
                }
            })
        })

        this.appendChild(pickerEl)
    }
}

window.customElements.define("wc-quick-start", QuickStart)
