import {htmlToElement} from "./index.js"
import {playerCaptures, playerNames, playerRanks, playerTimes, playerTypes, playClickSound} from "../scripts/index.js";

const CONFETTI_COLORS = ['var(--base-color-0)', 'var(--base-color-1)', 'var(--base-color-2)', 'var(--base-color-3)'];

function confettiDots() {
    return Array.from({length: 26}).map((_, i) => {
        const x = (i * 37) % 100;
        const y = (i * 53) % 100;
        const w = 4 + (i % 4) * 2;
        const h = 8 + (i % 5);
        const rot = (i * 31) % 360;
        return `<div style="position:absolute;left:${x}%;top:${y}%;width:${w}px;height:${h}px;background:hsl(${CONFETTI_COLORS[i % 4]});border-radius:1px;transform:rotate(${rot}deg);opacity:0.7;"></div>`;
    }).join('');
}

const PAWN_SVG = (playerIndex) => `
    <svg viewBox="0 0 32 32" class="text-player-${playerIndex}" style="width:160px;height:160px;filter:drop-shadow(0 4px 12px rgba(0,0,0,0.4));">
        <ellipse cx="16" cy="28" rx="8" ry="1.5" fill="rgba(0,0,0,0.25)"/>
        <path d="M16 4c3.2 0 5.5 2.4 5.5 5.2 0 1.8-1 3.2-2.4 4 1.7.7 2.9 1.8 3.6 3.4l1.1 2.6c.4 1 .1 2-.7 2.4-.2.1-.4.1-.6.1H9.5c-.9 0-1.6-.7-1.6-1.6 0-.3.1-.6.2-.9l1.1-2.6c.7-1.6 1.9-2.7 3.6-3.4-1.4-.8-2.4-2.2-2.4-4C10.4 6.4 12.8 4 16 4z" fill="currentColor"/>
        <path d="M16 4c3.2 0 5.5 2.4 5.5 5.2 0 1.8-1 3.2-2.4 4-.6-.3-1.3-.5-2-.5h-2.2c-.7 0-1.4.2-2 .5-1.4-.8-2.4-2.2-2.4-4C10.4 6.4 12.8 4 16 4z" fill="rgba(255,255,255,0.24)"/>
        <rect x="7.5" y="22" width="17" height="3.5" rx="1.4" fill="currentColor"/>
        <rect x="7.5" y="22" width="17" height="1.2" rx="0.6" fill="rgba(255,255,255,0.38)"/>
    </svg>`;

function formatGameTime(ms) {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return minutes > 0 ? `${minutes}m ${remainingSeconds}s` : `${remainingSeconds}s`;
}

class GameEnd extends HTMLElement {
    constructor() {
        super();
    }

    connectedCallback() {
        const rankArray = new Array(4);
        let winnerIndex = 0;
        for (let pi = 0; pi < playerRanks.length; pi++) {
            if (playerRanks[pi] > 0) {
                rankArray[playerRanks[pi] - 1] = pi;
                if (playerRanks[pi] === 1) winnerIndex = pi;
            }
        }

        const isHumanWinner = playerTypes[winnerIndex] === 'PLAYER';
        const winText = isHumanWinner ? 'You won.' : 'Game over.';

        const standingsHTML = rankArray.filter(pi => pi !== undefined).map((pi, idx) => {
            const name = (playerNames[pi] && String(playerNames[pi]).trim()) || (playerTypes[pi] === 'PLAYER' ? 'You' : 'Bot');
            const time = playerTimes[pi] > 0 ? formatGameTime(playerTimes[pi]) : '—';
            return `<div class="flex items-center gap-3 py-2 px-1 ${idx < 3 ? 'border-b border-white/[0.08]' : ''}">
                <div class="w-[18px] font-mono text-[13px] text-white/50">${idx + 1}.</div>
                <div class="w-3.5 h-3.5 rounded-full bg-player-${pi}"></div>
                <div class="flex-1 text-[15px]">${name}</div>
                <div class="font-mono text-[13px] text-white/60">${time}</div>
            </div>`;
        }).join('');

        const html = `
            <div class="flex flex-col min-h-[70vh] text-white" style="background:#1F1B14;">
                <div class="flex-1 flex flex-col items-center justify-center px-6 relative">
                    <div class="absolute inset-0 overflow-hidden pointer-events-none">${confettiDots()}</div>
                    <div class="mb-6 relative z-10">${PAWN_SVG(winnerIndex)}</div>
                    <div class="font-display text-[56px] leading-none tracking-tight text-center relative z-10" style="color:#F2EDE3;">${winText}</div>
                    <div class="text-[15px] mt-3 text-center max-w-[280px] leading-relaxed relative z-10" style="color:rgba(242,237,227,0.55);">Final standings</div>
                    <div class="mt-8 w-full rounded-2xl p-3.5 relative z-10" style="background:rgba(242,237,227,0.06);border:1px solid rgba(242,237,227,0.1);">
                        ${standingsHTML}
                    </div>
                </div>
                <div class="flex gap-2.5 px-4 pt-3 pb-4 relative z-10">
                    <button id="share-btn" class="flex-1 h-14 rounded-2xl bg-transparent cursor-pointer text-[15px]" style="color:#F2EDE3;border:1px solid rgba(242,237,227,0.2);">Share</button>
                    <button id="play-again" class="flex-[2] h-14 rounded-2xl border-0 cursor-pointer text-[15px] font-medium" style="background:#F2EDE3;color:#1F1B14;">Play again</button>
                </div>
            </div>`;

        const el = htmlToElement(html);

        el.querySelector("#play-again").addEventListener("click", () => {
            playClickSound();
            window.location.href = window.location.origin;
        });

        this.appendChild(el);
    }
}

window.customElements.define("wc-game-end", GameEnd);
