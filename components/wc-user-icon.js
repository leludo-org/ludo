import {
    htmlToElement
} from "./index.js"

//language=HTML
const USER_ICON_SVG = /*html*/ `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="user inline size-6 text-foreground">
    <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
</svg>
`

class UserIcon extends HTMLElement {
    constructor() {
        super()
    }

    connectedCallback() {
        const settingsElement = htmlToElement(USER_ICON_SVG)
        this.appendChild(settingsElement)
    }
}

window.customElements.define("wc-user-icon", UserIcon)