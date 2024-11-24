import {htmlToElement} from "./index.js"
import {playerCaptures, playerRanks, playerTimes, playerTypes} from "../scripts/index.js";

//language=HTML
const GAME_END_HTML = /*html*/ `
    <div class="display flex flex-col gap-6 text-center">
        <div class="text-xl font-bold">Game Concluded! Final Standings</div>
        <table class="">
            <thead class="font-bold text-underline">
            <tr>
                <td>Rank</td>
                <td>Player</td>
                <td>Captures</td>
                <td>Time</td>
            </tr>
            </thead>
            <tbody>
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