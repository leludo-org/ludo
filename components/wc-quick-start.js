import {htmlToElement} from "../utils.js";

//language=HTML
const QUICK_START_HTML = `
    <div class="flex flex-col gap-6 text-xl">
        <div class="flex gap-6">
            <label class="flex items-center gap-1 p-2">
                1
                <img src="/assets/icons/user.svg" class="size-6" alt="user">
            </label>

            <div class="flex-1 grid grid-cols-3 gap-2">
                <button id="qs,1,1"
                        class="flex items-center gap-1 justify-center quick-start rounded p-2 bg-white shadow hover:shadow-2xl hover:bg-gray-100">
                    1
                    <img src="/assets/icons/bot.svg" class="size-6" alt="user">
                </button>
                <button id="qs,1,2"
                        class="flex items-center gap-1 justify-center quick-start rounded p-2 bg-white shadow hover:shadow-2xl hover:bg-gray-100">
                    2
                    <img src="/assets/icons/bot.svg" class="size-6" alt="user">
                </button>
                <button id="qs,1,3"
                        class="flex items-center gap-1 justify-center quick-start rounded p-2 bg-white shadow hover:shadow-2xl hover:bg-gray-100">
                    3
                    <img src="/assets/icons/bot.svg" class="size-6" alt="user">
                </button>
            </div>
        </div>

        <div class="flex gap-6">
            <label class="flex items-center gap-1 p-2">
                2
                <img src="/assets/icons/user.svg" class="size-6" alt="user">
            </label>
            
            <div class="flex-1 grid grid-cols-3 gap-2">
                <button id="qs,2,0"
                        class="flex items-center gap-1 justify-center quick-start rounded p-2 bg-white shadow hover:shadow-2xl hover:bg-gray-100">
                    0
                    <img src="/assets/icons/bot.svg" class="size-6" alt="user">
                </button>
                <button id="qs,2,1"
                        class="flex items-center gap-1 justify-center quick-start rounded p-2 bg-white shadow hover:shadow-2xl hover:bg-gray-100">
                    1
                    <img src="/assets/icons/bot.svg" class="size-6" alt="user">
                </button>
                <button id="qs,2,2"
                        class="flex items-center gap-1 justify-center quick-start rounded p-2 bg-white shadow hover:shadow-2xl hover:bg-gray-100">
                    2
                    <img src="/assets/icons/bot.svg" class="size-6" alt="user">
                </button>
            </div>
        </div>

        <div class="flex gap-6">
            <label class="flex items-center gap-1 p-2">
                3
                <img src="/assets/icons/user.svg" class="size-6" alt="user">
            </label>

            <div class="flex-1 grid grid-cols-2 gap-2">
                <button id="qs,3,0"
                        class="flex items-center gap-1 justify-center quick-start rounded p-2 bg-white shadow hover:shadow-2xl hover:bg-gray-100">
                    0
                    <img src="/assets/icons/bot.svg" class="size-6" alt="user">
                </button>
                <button id="qs,3,1"
                        class="flex items-center gap-1 justify-center quick-start rounded p-2 bg-white shadow hover:shadow-2xl hover:bg-gray-100">
                    1
                    <img src="/assets/icons/bot.svg" class="size-6" alt="user">
                </button>
            </div>
        </div>

        <div class="flex gap-6">
            <label class="flex items-center gap-1 p-2">
                4
                <img src="/assets/icons/user.svg" class="size-6" alt="user">
            </label>

            <div class="flex-1 grid grid-cols-1 gap-2">
                <button id="qs,4,0"
                        class="flex-1 flex items-center gap-1 justify-center quick-start rounded p-2 bg-white shadow hover:shadow-2xl hover:bg-gray-100">
                    0
                    <img src="/assets/icons/bot.svg" class="size-6" alt="user">
                </button>
            </div>
        </div>

    </div>
`

class QuickStart extends HTMLElement {
    constructor() {
        super();
        const quickStartElement = htmlToElement(QUICK_START_HTML)
        this.appendChild(quickStartElement)
    }
}

window.customElements.define("wc-quick-start", QuickStart)