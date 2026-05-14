import {
    htmlToElement
} from "./index.bf0b1971.js"

//language=HTML
const BUTTON_HTML = /*html*/ `
<div class="rounded-lg px-4 py-3 bg-card shadow-md hover:shadow-lg hover:bg-card-hover cursor-pointer text-center transition-all duration-200 border border-border/20 active:scale-[0.98] active:shadow-sm font-medium tracking-wide">
</div>
`

class Button extends HTMLElement {
    static observedAttributes = ["button-text"]

    constructor() {
        super()
    }

    /**
     *
     * @param {string} name
     * @param {string} oldValue
     * @param {string} newValue
     */
    attributeChangedCallback(name, oldValue, newValue) {
        if (name === "button-text") {
            const buttonElement = htmlToElement(BUTTON_HTML)
            buttonElement.children[0].textContent = newValue
            this.appendChild(buttonElement)
        }
    }
}

window.customElements.define("wc-button", Button)