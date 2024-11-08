import { htmlToElement } from "../utils.js"

fetch("wc-dice/wc-dice.html")
    .then(stream => stream.text())
    .then(DICE_HTML => {
        class Dice extends HTMLElement {
            constructor() {
                super()

                // const shadowRoot = this.attachShadow({ mode: "closed" })
                const diceElement = htmlToElement(DICE_HTML)
                // shadowRoot.appendChild(diceElement)
                this.appendChild(diceElement)

                this.addEventListener("click", rollDice)
            }
        }

        window.customElements.define("wc-dice", Dice)
    })

    
function rollDice() {
    document.getElementById("audio-dice").play()

    let counter = 0;
    const interval = setInterval(() => {
        const lastDiceRoll = currentDiceRoll


        if (counter === 6) {
            clearInterval(interval)

            const weights = [1, 2, 2, 1, 2, 2];
            const cumulativeWeights = weights.map((sum => value => sum += value)(0));
            const maxWeight = cumulativeWeights[cumulativeWeights.length - 1];
            const randomValue = Math.random() * maxWeight;
            currentDiceRoll = cumulativeWeights.findIndex(cw => randomValue < cw) + 1;

            // if (currentDiceRoll === 6) {
            //     consecutiveSixesCount++
            // }

            // if (consecutiveSixesCount === 3) {
            //     updateCurrentPlayer()
            // } else {
            //     animateMovablePieces()
            // }
        } else {
            currentDiceRoll = (currentDiceRoll % 6) + 1
        }

        document.getElementById(`d${lastDiceRoll}`).classList.add("hidden")
        document.getElementById(`d${currentDiceRoll}`).classList.remove("hidden")

        counter++
    }, 100)
}