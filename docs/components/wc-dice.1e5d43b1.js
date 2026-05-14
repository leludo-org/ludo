import {
    htmlToElement
} from "./index.bf0b1971.js"
import {
    handleDiceRoll,
} from "../scripts/index.e8f102de.js";

//language=HTML
const DS = "background:radial-gradient(circle at 40% 35%,#333,#111);box-shadow:inset 0 1px 2px rgba(0,0,0,0.6),0 0.5px 0 rgba(255,255,255,0.15)";

//language=HTML
const DICE_HTML = /*html*/ `
<div id="dice" class="size-full rounded-xl aspect-square cursor-pointer transition-all duration-200 overflow-hidden"
     style="background:linear-gradient(145deg,#faf8f5,#e8e4df);box-shadow:3px 3px 8px rgba(0,0,0,0.25),-1px -1px 4px rgba(255,255,255,0.8),inset 0 1px 0 rgba(255,255,255,0.6);border:1px solid rgba(0,0,0,0.08);padding:14%;">
    <div id="d1" class="size-full grid grid-rows-3 grid-cols-3 gap-[10%]">
        <div class="dice-dot rounded-full row-start-2 col-start-2" style="${DS}"></div>
    </div>
    <div id="d2" class="size-full grid grid-rows-3 grid-cols-3 gap-[10%] hidden">
        <div class="dice-dot rounded-full" style="${DS}"></div>
        <div class="dice-dot rounded-full row-start-3 col-start-3" style="${DS}"></div>
    </div>
    <div id="d3" class="size-full grid grid-rows-3 grid-cols-3 gap-[10%] hidden">
        <div class="dice-dot rounded-full" style="${DS}"></div>
        <div class="dice-dot rounded-full row-start-2 col-start-2" style="${DS}"></div>
        <div class="dice-dot rounded-full row-start-3 col-start-3" style="${DS}"></div>
    </div>
    <div id="d4" class="size-full grid grid-rows-3 grid-cols-3 gap-[10%] hidden">
        <div class="dice-dot rounded-full" style="${DS}"></div>
        <div class="dice-dot rounded-full col-start-3" style="${DS}"></div>
        <div class="dice-dot rounded-full row-start-3" style="${DS}"></div>
        <div class="dice-dot rounded-full row-start-3 col-start-3" style="${DS}"></div>
    </div>
    <div id="d5" class="size-full grid grid-rows-3 grid-cols-3 gap-[10%] hidden">
        <div class="dice-dot rounded-full" style="${DS}"></div>
        <div class="dice-dot rounded-full col-start-3" style="${DS}"></div>
        <div class="dice-dot rounded-full row-start-2 col-start-2" style="${DS}"></div>
        <div class="dice-dot rounded-full row-start-3" style="${DS}"></div>
        <div class="dice-dot rounded-full row-start-3 col-start-3" style="${DS}"></div>
    </div>
    <div id="d6" class="size-full grid grid-rows-3 grid-cols-3 gap-[10%] hidden">
        <div class="dice-dot rounded-full" style="${DS}"></div>
        <div class="dice-dot rounded-full col-start-3" style="${DS}"></div>
        <div class="dice-dot rounded-full row-start-2" style="${DS}"></div>
        <div class="dice-dot rounded-full row-start-2 col-start-3" style="${DS}"></div>
        <div class="dice-dot rounded-full row-start-3" style="${DS}"></div>
        <div class="dice-dot rounded-full row-start-3 col-start-3" style="${DS}"></div>
    </div>
</div>
`

class Dice extends HTMLElement {
    constructor() {
        super()

        this.dataset.active = "true"

        const diceElement = htmlToElement(DICE_HTML)
        this.appendChild(diceElement)

        this.addEventListener("click", () => {
            this.handleDiceClick();
        })


        document.addEventListener("keyup", ($event) =>  {
            if ($event.key === " ") {
                this.handleDiceClick()
            }
        })
    }

    handleDiceClick() {
        if (this.dataset.active === "true") {
            handleDiceRoll()
        }
    }
}

window.customElements.define("wc-dice", Dice)