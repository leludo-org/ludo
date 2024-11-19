import {
    htmlToElement
} from "./index.js"
import {
    handleOnTokenMove,
} from "../scripts/index.js";

//language=HTML
const TOKEN_HTML = (playerIndex) => /*html*/ `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
         stroke-linecap="round" stroke-linejoin="round"
         class="fill-player-${playerIndex} award relative size-full min-w-full transition-all duration-200">
        <path d="m15.477 12.89 1.515 8.526a.5.5 0 0 1-.81.47l-3.58-2.687a1 1 0 0 0-1.197 0l-3.586 2.686a.5.5 0 0 1-.81-.469l1.514-8.526"/>
        <circle cx="12" cy="8" r="6"/>
    </svg>
`

class Token extends HTMLElement {
    static observedAttributes = ["id"]

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
        if (name === "id") {

            ["block", "transition-transform"].forEach(c => this.classList.add(c))

            const id = newValue;
            const idTokens = id.split("-")
            const playerIndex = idTokens[1]
            const tokenIndex = idTokens[2]
            let tokenHTML = TOKEN_HTML(playerIndex);
            const tokenElement = htmlToElement(tokenHTML)
            this.appendChild(tokenElement) // fixme: if triggered multiple time would cause issues

            this.addEventListener("click", () => {
                this.handleTokenClick(id);
            })

            document.addEventListener("keyup", ($event) =>  {
                if ($event.key === (+tokenIndex + 1).toString()) {
                    this.handleTokenClick(id)
                }
            })
        }
    }

    handleTokenClick(id) {
        const isTokenActive = this.children[0].classList.contains("animate-bounce");
        if (isTokenActive) {
            handleOnTokenMove(id)
        }
    }
}

window.customElements.define("wc-token", Token)