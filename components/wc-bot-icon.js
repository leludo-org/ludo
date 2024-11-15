import {htmlToElement} from "../utils.js"

//language=HTML
const BOT_ICON_SVG = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
         stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
         class="bot inline size-6 text-foreground">
        <path d="M12 8V4H8"/>
        <rect width="16" height="12" x="4" y="8" rx="2"/>
        <path d="M2 14h2"/>
        <path d="M20 14h2"/>
        <path d="M15 13v2"/>
        <path d="M9 13v2"/>
    </svg>
`

class BotIcon extends HTMLElement {
    constructor() {
        super()
    }

    connectedCallback() {
        const settingsElement = htmlToElement(BOT_ICON_SVG)
        this.appendChild(settingsElement)
    }
}

window.customElements.define("wc-bot-icon", BotIcon)