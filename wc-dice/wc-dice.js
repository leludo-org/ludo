import { htmlToElement } from "../utils.js"

fetch("wc-dice/wc-dice.html")
    .then(stream => stream.text())
    .then(DICE_HTML => {
        class Dice extends HTMLElement {
            constructor() {
                super()
                const shadowRoot = this.attachShadow({ mode: "closed" })
                const div = document.createElement("div")
                shadowRoot.appendChild(htmlToElement(DICE_HTML))
            }
        }

        window.customElements.define("wc-dice", Dice)
    })