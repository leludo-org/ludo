import {
    htmlToElement
} from "./index.js";
import {handleGameStart, playClickSound} from "../scripts/index.js";

const COLOR_NAMES = ["Red", "Green", "Yellow", "Blue"];

//language=HTML
const QUICK_START_HTML = /*html*/ `
    <div class="flex flex-col gap-5 max-w-sm mx-auto">
        <p class="text-center text-xs font-medium tracking-widest uppercase opacity-50">Select Players</p>

        <div class="grid grid-cols-2 gap-3">
            <button id="qs,1,3"
                    class="quick-start flex flex-col items-center gap-2 rounded-xl p-5 bg-card shadow-md hover:shadow-xl hover:scale-[1.03] transition-all duration-200 cursor-pointer border border-border/30 hover:border-foreground/15 relative overflow-hidden"
                    style="border-top: 3px solid hsl(var(--player-0));">
                <span class="text-3xl font-bold">1</span>
                <span class="text-xs opacity-50 tracking-wider uppercase">vs 3 Bots</span>
            </button>

            <button id="qs,2,2"
                    class="quick-start flex flex-col items-center gap-2 rounded-xl p-5 bg-card shadow-md hover:shadow-xl hover:scale-[1.03] transition-all duration-200 cursor-pointer border border-border/30 hover:border-foreground/15 relative overflow-hidden"
                    style="border-top: 3px solid hsl(var(--player-1));">
                <span class="text-3xl font-bold">2</span>
                <span class="text-xs opacity-50 tracking-wider uppercase">+ 2 Bots</span>
            </button>

            <button id="qs,3,1"
                    class="quick-start flex flex-col items-center gap-2 rounded-xl p-5 bg-card shadow-md hover:shadow-xl hover:scale-[1.03] transition-all duration-200 cursor-pointer border border-border/30 hover:border-foreground/15 relative overflow-hidden"
                    style="border-top: 3px solid hsl(var(--player-3));">
                <span class="text-3xl font-bold">3</span>
                <span class="text-xs opacity-50 tracking-wider uppercase">+ 1 Bot</span>
            </button>

            <button id="qs,4,0"
                    class="quick-start flex flex-col items-center gap-2 rounded-xl p-5 bg-card shadow-md hover:shadow-xl hover:scale-[1.03] transition-all duration-200 cursor-pointer border border-border/30 hover:border-foreground/15 relative overflow-hidden"
                    style="border-top: 3px solid hsl(var(--player-2));">
                <span class="text-3xl font-bold">4</span>
                <span class="text-xs opacity-50 tracking-wider uppercase">No Bots</span>
            </button>
        </div>

        <details class="mt-2">
            <summary class="text-center text-xs opacity-40 cursor-pointer hover:opacity-70 tracking-widest uppercase font-medium transition-opacity">More options</summary>
            <div class="grid grid-cols-3 gap-2 mt-3 text-sm">
                <button id="qs,1,1" class="quick-start rounded-lg p-2 bg-card shadow-sm hover:shadow-md hover:scale-[1.03] transition-all duration-200 cursor-pointer border border-border/20 hover:bg-card-hover">
                    <div>1 vs 1</div>
                    <div class="opacity-40 text-xs">Bot</div>
                </button>
                <button id="qs,1,2" class="quick-start rounded-lg p-2 bg-card shadow-sm hover:shadow-md hover:scale-[1.03] transition-all duration-200 cursor-pointer border border-border/20 hover:bg-card-hover">
                    <div>1 vs 2</div>
                    <div class="opacity-40 text-xs">Bots</div>
                </button>
                <button id="qs,2,0" class="quick-start rounded-lg p-2 bg-card shadow-sm hover:shadow-md hover:scale-[1.03] transition-all duration-200 cursor-pointer border border-border/20 hover:bg-card-hover">
                    <div>2 Players</div>
                    <div class="opacity-40 text-xs">Only</div>
                </button>
                <button id="qs,2,1" class="quick-start rounded-lg p-2 bg-card shadow-sm hover:shadow-md hover:scale-[1.03] transition-all duration-200 cursor-pointer border border-border/20 hover:bg-card-hover">
                    <div>2 + 1</div>
                    <div class="opacity-40 text-xs">Bot</div>
                </button>
                <button id="qs,3,0" class="quick-start rounded-lg p-2 bg-card shadow-sm hover:shadow-md hover:scale-[1.03] transition-all duration-200 cursor-pointer border border-border/20 hover:bg-card-hover">
                    <div>3 Players</div>
                    <div class="opacity-40 text-xs">Only</div>
                </button>
            </div>
        </details>
    </div>
`

class QuickStart extends HTMLElement {
    constructor() {
        super();
    }

    connectedCallback() {
        const quickStartElement = htmlToElement(QUICK_START_HTML)

        quickStartElement.querySelectorAll(".quick-start").forEach((el) => {
            const quickStartId = el.id

            el.addEventListener("click", () => {
                playClickSound()
                const parts = quickStartId.split(",")
                const humanCount = +parts[1]
                const botCount = +parts[2]

                if (humanCount === 4) {
                    handleGameStart(quickStartId)
                } else {
                    this.showColorPicker(humanCount, botCount)
                }
            })
        })

        this.appendChild(quickStartElement)
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
            this.innerHTML = ""
            this.connectedCallback()
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
