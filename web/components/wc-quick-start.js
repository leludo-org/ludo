import {
    htmlToElement
} from "./index.js";
import {handleGameStart} from "../scripts";

//language=HTML
const QUICK_START_HTML = /*html*/ `
    <div class="flex flex-col gap-6 text-xl">
        <div class="flex gap-6">
            <label class="flex items-center gap-1 p-2">
                1
                <wc-user-icon></wc-user-icon>
            </label>

            <div class="flex-1 grid grid-cols-3 gap-2">
                <button id="qs,1,1"
                        class="flex items-center gap-1 justify-center quick-start rounded p-2 bg-card shadow hover:shadow-2xl hover:bg-card/80">
                    1
                    <wc-bot-icon></wc-bot-icon>
                </button>
                <button id="qs,1,2"
                        class="flex items-center gap-1 justify-center quick-start rounded p-2 bg-card shadow hover:shadow-2xl hover:bg-card/80">
                    2
                    <wc-bot-icon></wc-bot-icon>
                </button>
                <button id="qs,1,3"
                        class="flex items-center gap-1 justify-center quick-start rounded p-2 bg-card shadow hover:shadow-2xl hover:bg-card/80">
                    3
                    <wc-bot-icon></wc-bot-icon>
                </button>
            </div>
        </div>

        <div class="flex gap-6">
            <label class="flex items-center gap-1 p-2">
                2
                <wc-user-icon></wc-user-icon>
            </label>

            <div class="flex-1 grid grid-cols-3 gap-2">
                <button id="qs,2,0"
                        class="flex items-center gap-1 justify-center quick-start rounded p-2 bg-card shadow hover:shadow-2xl hover:bg-card/80">
                    0
                    <wc-bot-icon></wc-bot-icon>
                </button>
                <button id="qs,2,1"
                        class="flex items-center gap-1 justify-center quick-start rounded p-2 bg-card shadow hover:shadow-2xl hover:bg-card/80">
                    1
                    <wc-bot-icon></wc-bot-icon>
                </button>
                <button id="qs,2,2"
                        class="flex items-center gap-1 justify-center quick-start rounded p-2 bg-card shadow hover:shadow-2xl hover:bg-card/80">
                    2
                    <wc-bot-icon></wc-bot-icon>
                </button>
            </div>
        </div>

        <div class="flex gap-6">
            <label class="flex items-center gap-1 p-2">
                3
                <wc-user-icon></wc-user-icon>
            </label>

            <div class="flex-1 grid grid-cols-2 gap-2">
                <button id="qs,3,0"
                        class="flex items-center gap-1 justify-center quick-start rounded p-2 bg-card shadow hover:shadow-2xl hover:bg-card/80">
                    0
                    <wc-bot-icon></wc-bot-icon>
                </button>
                <button id="qs,3,1"
                        class="flex items-center gap-1 justify-center quick-start rounded p-2 bg-card shadow hover:shadow-2xl hover:bg-card/80">
                    1
                    <wc-bot-icon></wc-bot-icon>
                </button>
            </div>
        </div>

        <div class="flex gap-6">
            <label class="flex items-center gap-1 p-2">
                4
                <wc-user-icon></wc-user-icon>
            </label>

            <div class="flex-1 grid grid-cols-1 gap-2">
                <button id="qs,4,0"
                        class="flex-1 flex items-center gap-1 justify-center quick-start rounded p-2 bg-card shadow hover:shadow-2xl hover:bg-card/80">
                    0
                    <wc-bot-icon></wc-bot-icon>
                </button>
            </div>
        </div>

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