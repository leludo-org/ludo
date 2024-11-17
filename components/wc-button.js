import {
    htmlToElement
} from "./index.js"

//language=HTML
const BUTTON_HTML = /*html*/ `
<div class="rounded p-2 bg-card shadow hover:shadow-2xl hover:bg-card/90 cursor-pointer">
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