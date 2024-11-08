import { htmlToElement } from "./utils.js"

// todo: don't like the fact formatting is not working below, also double importing styles
const DICE_HTML = `
<link rel="stylesheet" href="output.css" />

<div class="size-full rounded aspect-square p-[2%] shadow-xl bg-white cursor-pointer transition-all duration-200 animate-bounce">
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
        const shadowRoot = this.attachShadow({ mode: "closed" })
        const div = document.createElement("div")
        shadowRoot.appendChild(htmlToElement(DICE_HTML))
    }
}

window.customElements.define("wc-dice", Dice)