import {htmlToElement} from "../utils.js"
import {rollDice} from "../main.js"
import {publishGameEvent} from "../game-events.js";

//language=HTML
const DICE_HTML = `
    <div id="dice"
         class="size-full rounded aspect-square p-[2%] shadow-xl bg-white cursor-pointer transition-all duration-200 animate-bounce">
        <div id="d1" class="size-full grid grid-rows-3 grid-cols-3 gap-[10%]">
            <div class="bg-black rounded-full row-start-2 col-start-2"></div>
        </div>
        <div id="d2" class="size-full grid grid-rows-3 grid-cols-3 gap-[10%] hidden">
            <div class="bg-black rounded-full"></div>
            <div class="bg-black rounded-full row-start-3 col-start-3"></div>
        </div>
        <div id="d3" class="size-full grid grid-rows-3 grid-cols-3 gap-[10%] hidden">
            <div class="bg-black rounded-full"></div>
            <div class="bg-black rounded-full row-start-2 col-start-2"></div>
            <div class="bg-black rounded-full row-start-3 col-start-3"></div>
        </div>
        <div id="d4" class="size-full grid grid-rows-3 grid-cols-3 gap-[10%] hidden">
            <div class="bg-black rounded-full"></div>
            <div class="bg-black rounded-full col-start-3"></div>
            <div class="bg-black rounded-full row-start-3"></div>
            <div class="bg-black rounded-full row-start-3 col-start-3"></div>
        </div>
        <div id="d5" class="size-full grid grid-rows-3 grid-cols-3 gap-[10%] hidden">
            <div class="bg-black rounded-full"></div>
            <div class="bg-black rounded-full col-start-3"></div>
            <div class="bg-black rounded-full row-start-2 col-start-2"></div>
            <div class="bg-black rounded-full row-start-3"></div>
            <div class="bg-black rounded-full row-start-3 col-start-3"></div>
        </div>
        <div id="d6" class="size-full grid grid-rows-3 grid-cols-3 gap-[10%] hidden">
            <div class="bg-black rounded-full"></div>
            <div class="bg-black rounded-full col-start-3"></div>
            <div class="bg-black rounded-full row-start-2"></div>
            <div class="bg-black rounded-full row-start-2 col-start-3"></div>
            <div class="bg-black rounded-full row-start-3"></div>
            <div class="bg-black rounded-full row-start-3 col-start-3"></div>
        </div>
    </div>
`

class Dice extends HTMLElement {
    constructor() {
        super()

        const diceElement = htmlToElement(DICE_HTML)
        this.appendChild(diceElement)

        this.addEventListener("click", rollDice)
    }
}

window.customElements.define("wc-dice", Dice)


/**
 *
 * @param {string} targetContainerId
 */
export function moveDice(targetContainerId) {
    const diceElement = document.getElementById("wc-dice")
    const targetContainer = document.getElementById(targetContainerId)
    targetContainer.appendChild(diceElement)

    publishGameEvent("DICE_MOVED")
}