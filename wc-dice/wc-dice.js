import { htmlToElement } from "../utils.js"
import { rollDice } from "../main.js"

fetch("wc-dice/wc-dice.html")
    .then(stream => stream.text())
    .then(DICE_HTML => {
        class Dice extends HTMLElement {
            constructor() {
                super()

                const diceElement = htmlToElement(DICE_HTML)
                this.appendChild(diceElement)

                this.addEventListener("click", rollDice)
            }
        }

        window.customElements.define("wc-dice", Dice)
    })
