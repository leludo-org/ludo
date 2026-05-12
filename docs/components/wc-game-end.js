import {htmlToElement} from "./index.js"
import {playerCaptures, playerRanks, playerTimes, playerTypes, playClickSound} from "../scripts/index.js";

//language=HTML
const GAME_END_HTML = /*html*/ `
    <div class="display flex flex-col gap-8 text-center max-w-sm mx-auto">
        <div>
            <div class="text-2xl font-bold tracking-tight">Game Over</div>
            <div class="text-sm opacity-50 mt-1">Final Standings</div>
        </div>
        <table class="w-full text-sm">
            <thead>
            <tr class="border-b-2 border-border/30 text-xs uppercase tracking-widest opacity-60">
                <td class="pb-2">#</td>
                <td class="pb-2">Player</td>
                <td class="pb-2">Captures</td>
                <td class="pb-2">Time</td>
            </tr>
            </thead>
            <tbody class="[&>tr]:border-b [&>tr]:border-border/15 [&>tr>td]:py-3 [&>tr:first-child>td]:pt-4">
            </tbody>
        </table>
        <wc-button id="play-again" button-text="Play Again"></wc-button>
    </div>`;

/**
 * @param {number} ms
 * @returns {string}
 */
function formatGameTime(ms) {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;

    return minutes > 0 ?
        `${minutes}m ${remainingSeconds}s` :
        `${remainingSeconds}s`;
}

class GameEnd extends HTMLElement {
    constructor() {
        super();
    }

    connectedCallback() {
        const boardElement = htmlToElement(GAME_END_HTML);
        const tableBody = boardElement.querySelector("tbody");
        boardElement.querySelector("#play-again").addEventListener("click", () => {
            playClickSound()
            window.location.href = window.location.origin;
        });

        const rankArray = new Array(4);
        for (let playerIndex = 0; playerIndex < playerRanks.length; playerIndex++) {
            if (playerRanks[playerIndex] > 0) {
                rankArray[playerRanks[playerIndex] - 1] = playerIndex
            }
        }

        for (let playerRank = 0; playerRank < rankArray.length; playerRank++) {
            const playerIndex = rankArray[playerRank];
            if (playerIndex !== undefined) {
                const row = htmlToElement(
                    //language=HTML
                    /*html*/
                    `
                            <tr>
                                <td>${playerRank + 1}</td>
                                <td>${playerTypes[playerIndex]} ${playerIndex}</td>
                                <td>${playerCaptures[playerIndex]}</td>
                                <td>${formatGameTime(playerTimes[playerIndex])}</td>
                            </tr>
                        `
                );
                tableBody.appendChild(row);
            }
        }

        this.appendChild(boardElement);
    }
}

window.customElements.define("wc-game-end", GameEnd);