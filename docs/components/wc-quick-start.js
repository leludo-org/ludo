import {
    htmlToElement
} from "./index.js";
import {handleGameStart} from "../scripts/index.js";

//language=HTML
const QUICK_START_HTML = /*html*/ `
    <div class="flex flex-col gap-4 max-w-sm mx-auto">
        <p class="text-center text-lg opacity-70">How many players?</p>

        <div class="grid grid-cols-2 gap-3">
            <button id="qs,1,3"
                    class="quick-start flex flex-col items-center gap-2 rounded-lg p-4 bg-card shadow-lg hover:shadow-2xl hover:scale-105 transition-transform cursor-pointer border-2 border-transparent hover:border-foreground/20">
                <span class="text-3xl">1</span>
                <span class="text-sm opacity-60">vs 3 Bots</span>
            </button>

            <button id="qs,2,2"
                    class="quick-start flex flex-col items-center gap-2 rounded-lg p-4 bg-card shadow-lg hover:shadow-2xl hover:scale-105 transition-transform cursor-pointer border-2 border-transparent hover:border-foreground/20">
                <span class="text-3xl">2</span>
                <span class="text-sm opacity-60">+ 2 Bots</span>
            </button>

            <button id="qs,3,1"
                    class="quick-start flex flex-col items-center gap-2 rounded-lg p-4 bg-card shadow-lg hover:shadow-2xl hover:scale-105 transition-transform cursor-pointer border-2 border-transparent hover:border-foreground/20">
                <span class="text-3xl">3</span>
                <span class="text-sm opacity-60">+ 1 Bot</span>
            </button>

            <button id="qs,4,0"
                    class="quick-start flex flex-col items-center gap-2 rounded-lg p-4 bg-card shadow-lg hover:shadow-2xl hover:scale-105 transition-transform cursor-pointer border-2 border-transparent hover:border-foreground/20">
                <span class="text-3xl">4</span>
                <span class="text-sm opacity-60">No Bots</span>
            </button>
        </div>

        <details class="mt-2">
            <summary class="text-center text-sm opacity-50 cursor-pointer hover:opacity-80">More options</summary>
            <div class="grid grid-cols-3 gap-2 mt-3 text-sm">
                <button id="qs,1,1" class="quick-start rounded p-2 bg-card shadow hover:shadow-lg hover:scale-105 transition-transform cursor-pointer">
                    <div>1 vs 1</div>
                    <div class="opacity-50 text-xs">Bot</div>
                </button>
                <button id="qs,1,2" class="quick-start rounded p-2 bg-card shadow hover:shadow-lg hover:scale-105 transition-transform cursor-pointer">
                    <div>1 vs 2</div>
                    <div class="opacity-50 text-xs">Bots</div>
                </button>
                <button id="qs,2,0" class="quick-start rounded p-2 bg-card shadow hover:shadow-lg hover:scale-105 transition-transform cursor-pointer">
                    <div>2 Players</div>
                    <div class="opacity-50 text-xs">Only</div>
                </button>
                <button id="qs,2,1" class="quick-start rounded p-2 bg-card shadow hover:shadow-lg hover:scale-105 transition-transform cursor-pointer">
                    <div>2 + 1</div>
                    <div class="opacity-50 text-xs">Bot</div>
                </button>
                <button id="qs,3,0" class="quick-start rounded p-2 bg-card shadow hover:shadow-lg hover:scale-105 transition-transform cursor-pointer">
                    <div>3 Players</div>
                    <div class="opacity-50 text-xs">Only</div>
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
                handleGameStart(quickStartId)
            })
        })

        this.appendChild(quickStartElement)
    }
}

window.customElements.define("wc-quick-start", QuickStart)