import {
    htmlToElement
} from "./index.bf0b1971.js"
import {handleGamePause, handleOnTokenMove, playClickSound} from "../scripts/index.e8f102de.js";

//language=HTML
const STAR_D = "M12 2.2l2.8 6.3 6.8.5-5.2 4.4 1.6 6.6L12 16.6l-6 3.4 1.6-6.6L2.4 9l6.8-.5z";

const CORNER_RIGHT_DOWN = `<polyline points="10 15 15 20 20 15"/><path d="M4 4h7a4 4 0 0 1 4 4v12"/>`;
const CORNER_UP_RIGHT = `<polyline points="15 14 20 9 15 4"/><path d="M4 20v-7a4 4 0 0 1 4-4h12"/>`;
const CORNER_DOWN_LEFT = `<polyline points="9 10 4 15 9 20"/><path d="M20 4v7a4 4 0 0 1-4 4H4"/>`;
const CORNER_LEFT_UP = `<polyline points="14 9 9 4 4 9"/><path d="M20 20h-7a4 4 0 0 1-4-4V4"/>`;

const entryCellSvg = (playerClass, cornerInner) => `
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="${playerClass} size-[68%] pointer-events-none absolute inset-0 m-auto opacity-70">${cornerInner}</svg>`;

const safeCellSvg = (playerClass) => `
    <svg viewBox="0 0 24 24" class="size-[72%] pointer-events-none absolute inset-0 m-auto"><path d="${STAR_D}" class="${playerClass}" opacity="0.85"/></svg>`;

const SC = "relative"; // cell base class for stacking

//language=HTML
const BOARD_HTML = /*html*/ `
    <div class="flex flex-col min-h-[calc(100vh-16px)]">
        <!-- Top bar -->
        <div class="flex items-center pt-1 pb-6 gap-2">
            <button id="g-pause-btn" class="w-[38px] h-[38px] rounded-full bg-transparent border border-foreground/15 flex items-center justify-center cursor-pointer opacity-70 hover:opacity-100 transition-opacity">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>
            </button>
            <div class="flex-1"></div>
            <div id="turn-counter" class="text-xs opacity-50 tracking-widest uppercase">Turn 0</div>
            <div class="flex-1"></div>
            <button id="g-settings-btn" class="w-[38px] h-[38px] rounded-full bg-transparent border border-foreground/15 flex items-center justify-center cursor-pointer opacity-70 hover:opacity-100 transition-opacity">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M12 15.5a3.5 3.5 0 100-7 3.5 3.5 0 000 7zM19.4 13.5a7.6 7.6 0 000-3l2-1.6-2-3.5-2.4.8a7.5 7.5 0 00-2.6-1.5l-.4-2.5h-4l-.4 2.5a7.5 7.5 0 00-2.6 1.5l-2.4-.8-2 3.5 2 1.6a7.6 7.6 0 000 3l-2 1.6 2 3.5 2.4-.8a7.5 7.5 0 002.6 1.5l.4 2.5h4l.4-2.5a7.5 7.5 0 002.6-1.5l2.4.8 2-3.5-2-1.6z"/></svg>
            </button>
        </div>

        <!-- Spacer pushes board to bottom -->
        <div class="flex-1"></div>

        <!-- Hidden home for wc-dice when no active corner has it yet -->
        <div id="dice-home" class="hidden"><wc-dice id="wc-dice"></wc-dice></div>

        <!-- Top corner row (seats 0/1, rotated 180°) -->
        <div id="corner-row-top" class="flex justify-between items-start px-3 pt-2 gap-2" style="min-height:56px;">
            <div id="b0" class="empty:hidden"></div>
            <div id="b1" class="empty:hidden"></div>
        </div>

        <!-- Board -->
        <div class="flex items-center justify-center px-3 pt-3">
            <div class="relative w-full">
                <div class="grid grid-rows-5 grid-cols-5 gap-0 rounded-xl aspect-square w-full" style="box-shadow: 0 14px 40px -10px rgba(31,27,20,0.22), 0 2px 6px rgba(31,27,20,0.06), inset 0 0 0 1px rgba(31,27,20,0.06);">

            <div class="bg-player-0 row-span-2 col-span-2 flex items-center justify-center rounded-tl-xl">
                <div class="bg-player-0-light size-4/6 grid grid-cols-2 grid-rows-2 rounded-lg shadow-inner border border-board-border/30">
                    <div class="flex items-center justify-center">
                        <div id="h-0-0" class="size-1/2 rounded-full bg-background border-2 border-player-0"></div>
                    </div>
                    <div class="flex items-center justify-center">
                        <div id="h-0-1" class="size-1/2 rounded-full bg-background border-2 border-player-0"></div>
                    </div>
                    <div class="flex items-center justify-center">
                        <div id="h-0-2" class="size-1/2 rounded-full bg-background border-2 border-player-0"></div>
                    </div>
                    <div class="flex items-center justify-center">
                        <div id="h-0-3" class="size-1/2 rounded-full bg-background border-2 border-player-0"></div>
                    </div>
                </div>
            </div>

            <div class="-y row-span-2 grid grid-cols-3 grid-rows-6 [&>div]:outline [&>div]:outline-1 [&>div]:outline-board-border/40">
                <div id="m10" class="${SC}"></div>
                <div id="m11" class="relative flex items-center justify-center ${SC}">${entryCellSvg('text-player-1', CORNER_RIGHT_DOWN)}</div>
                <div id="m12" class="${SC}"></div>
                <div id="m9" class="${SC}"></div>
                <div id="p1s1" class="bg-player-1-path ${SC}"></div>
                <div id="m13" class="bg-player-1-path ${SC}"></div>
                <div id="m8" class="bg-safe-tint relative flex items-center justify-center ${SC}">${safeCellSvg('fill-player-1')}</div>
                <div id="p1s2" class="bg-player-1-path ${SC}"></div>
                <div id="m14" class="${SC}"></div>
                <div id="m7" class="${SC}"></div>
                <div id="p1s3" class="bg-player-1-path ${SC}"></div>
                <div id="m15" class="${SC}"></div>
                <div id="m6" class="${SC}"></div>
                <div id="p1s4" class="bg-player-1-path ${SC}"></div>
                <div id="m16" class="${SC}"></div>
                <div id="m5" class="${SC}"></div>
                <div id="p1s5" class="bg-player-1-path ${SC}"></div>
                <div id="m17" class="${SC}"></div>
            </div>

            <div class="bg-player-1 row-span-2 col-span-2 flex items-center justify-center rounded-tr-xl">
                <div class="bg-player-1-light size-4/6 grid grid-cols-2 grid-rows-2 rounded-lg shadow-inner border border-board-border/30">
                    <div class="flex items-center justify-center">
                        <div id="h-1-0" class="size-1/2 rounded-full bg-background border-2 border-player-1"></div>
                    </div>
                    <div class="flex items-center justify-center">
                        <div id="h-1-1" class="size-1/2 rounded-full bg-background border-2 border-player-1"></div>
                    </div>
                    <div class="flex items-center justify-center">
                        <div id="h-1-2" class="size-1/2 rounded-full bg-background border-2 border-player-1"></div>
                    </div>
                    <div class="flex items-center justify-center">
                        <div id="h-1-3" class="size-1/2 rounded-full bg-background border-2 border-player-1"></div>
                    </div>
                </div>
            </div>

            <div class="-x col-span-2 grid grid-cols-6 grid-rows-3 [&>div]:outline [&>div]:outline-1 [&>div]:outline-board-border/40">
                <div id="m51" class="${SC}"></div>
                <div id="m0" class="bg-player-0-path ${SC}"></div>
                <div id="m1" class="${SC}"></div>
                <div id="m2" class="${SC}"></div>
                <div id="m3" class="${SC}"></div>
                <div id="m4" class="${SC}"></div>
                <div id="m50" class="relative flex items-center justify-center ${SC}">${entryCellSvg('text-player-0', CORNER_UP_RIGHT)}</div>
                <div id="p0s1" class="bg-player-0-path ${SC}"></div>
                <div id="p0s2" class="bg-player-0-path ${SC}"></div>
                <div id="p0s3" class="bg-player-0-path ${SC}"></div>
                <div id="p0s4" class="bg-player-0-path ${SC}"></div>
                <div id="p0s5" class="bg-player-0-path ${SC}"></div>
                <div id="m49" class="${SC}"></div>
                <div id="m48" class="${SC}"></div>
                <div id="m47" class="bg-safe-tint relative flex items-center justify-center ${SC}">${safeCellSvg('fill-player-0')}</div>
                <div id="m46" class="${SC}"></div>
                <div id="m45" class="${SC}"></div>
                <div id="m44" class="${SC}"></div>
            </div>

            <div class="relative overflow-clip bg-board-cell">
                <div id="p0s6"
                     class="absolute size-full bg-player-0-path [clip-path:polygon(0_0,_0_100%,_50%_50%)]"></div>
                <div id="p1s6"
                     class="absolute size-full bg-player-1-path [clip-path:polygon(0_0,_100%_0,_50%_50%)]"></div>
                <div id="p3s6"
                     class="absolute size-full bg-player-3-path [clip-path:polygon(0_100%,_100%_100%,_50%_50%)]"></div>
                <div id="p2s6"
                     class="absolute size-full bg-player-2-path [clip-path:polygon(100%_0,_100%_100%,_50%_50%)]"></div>
            </div>

            <div class="-x col-span-2 grid grid-cols-6 grid-rows-3 [&>div]:outline [&>div]:outline-1 [&>div]:outline-board-border/40">
                <div id="m18" class="${SC}"></div>
                <div id="m19" class="${SC}"></div>
                <div id="m20" class="${SC}"></div>
                <div id="m21" class="bg-safe-tint relative flex items-center justify-center ${SC}">${safeCellSvg('fill-player-2')}</div>
                <div id="m22" class="${SC}"></div>
                <div id="m23" class="${SC}"></div>
                <div id="p2s5" class="bg-player-2-path ${SC}"></div>
                <div id="p2s4" class="bg-player-2-path ${SC}"></div>
                <div id="p2s3" class="bg-player-2-path ${SC}"></div>
                <div id="p2s2" class="bg-player-2-path ${SC}"></div>
                <div id="p2s1" class="bg-player-2-path ${SC}"></div>
                <div id="m24" class="relative flex items-center justify-center ${SC}">${entryCellSvg('text-player-2', CORNER_DOWN_LEFT)}</div>
                <div id="m30" class="${SC}"></div>
                <div id="m29" class="${SC}"></div>
                <div id="m28" class="${SC}"></div>
                <div id="m27" class="${SC}"></div>
                <div id="m26" class="bg-player-2-path ${SC}"></div>
                <div id="m25" class="${SC}"></div>
            </div>

            <div class="bg-player-3 row-span-2 col-span-2 flex items-center justify-center rounded-bl-xl">
                <div class="bg-player-3-light size-4/6 grid grid-cols-2 grid-rows-2 rounded-lg shadow-inner border border-board-border/30">
                    <div class="flex items-center justify-center">
                        <div id="h-3-0" class="size-1/2 rounded-full bg-background border-2 border-player-3"></div>
                    </div>
                    <div class="flex items-center justify-center">
                        <div id="h-3-1" class="size-1/2 rounded-full bg-background border-2 border-player-3"></div>
                    </div>
                    <div class="flex items-center justify-center">
                        <div id="h-3-2" class="size-1/2 rounded-full bg-background border-2 border-player-3"></div>
                    </div>
                    <div class="flex items-center justify-center">
                        <div id="h-3-3" class="size-1/2 rounded-full bg-background border-2 border-player-3"></div>
                    </div>
                </div>
            </div>

            <div class="-y row-span-2 grid grid-cols-3 grid-rows-6 [&>div]:outline [&>div]:outline-1 [&>div]:outline-board-border/40">
                <div id="m43" class="${SC}"></div>
                <div id="p3s5" class="bg-player-3-path ${SC}"></div>
                <div id="m31" class="${SC}"></div>
                <div id="m42" class="${SC}"></div>
                <div id="p3s4" class="bg-player-3-path ${SC}"></div>
                <div id="m32" class="${SC}"></div>
                <div id="m41" class="${SC}"></div>
                <div id="p3s3" class="bg-player-3-path ${SC}"></div>
                <div id="m33" class="${SC}"></div>
                <div id="m40" class="${SC}"></div>
                <div id="p3s2" class="bg-player-3-path ${SC}"></div>
                <div id="m34" class="bg-safe-tint relative flex items-center justify-center ${SC}">${safeCellSvg('fill-player-3')}</div>
                <div id="m39" class="bg-player-3-path ${SC}"></div>
                <div id="p3s1" class="bg-player-3-path ${SC}"></div>
                <div id="m35" class="${SC}"></div>
                <div id="m38" class="${SC}"></div>
                <div id="m37" class="relative flex items-center justify-center ${SC}">${entryCellSvg('text-player-3', CORNER_LEFT_UP)}</div>
                <div id="m36" class="${SC}"></div>
            </div>

            <div class="bg-player-2 row-span-2 col-span-2 flex items-center justify-center rounded-br-xl">
                <div class="bg-player-2-light size-4/6 grid grid-cols-2 grid-rows-2 rounded-lg shadow-inner border border-board-border/30">
                    <div class="flex items-center justify-center">
                        <div id="h-2-0" class="size-1/2 rounded-full bg-background border-2 border-player-2"></div>
                    </div>
                    <div class="flex items-center justify-center">
                        <div id="h-2-1" class="size-1/2 rounded-full bg-background border-2 border-player-2"></div>
                    </div>
                    <div class="flex items-center justify-center">
                        <div id="h-2-2" class="size-1/2 rounded-full bg-background border-2 border-player-2"></div>
                    </div>
                    <div class="flex items-center justify-center">
                        <div id="h-2-3" class="size-1/2 rounded-full bg-background border-2 border-player-2"></div>
                    </div>
                </div>
            </div>

            </div>
                </div>
            </div>

        <!-- Bottom corner row (seats 3/2, upright) -->
        <div id="corner-row-bottom" class="flex justify-between items-end px-3 pt-3 pb-2 gap-2" style="min-height:56px;">
            <div id="b3" class="empty:hidden"></div>
            <div id="b2" class="empty:hidden"></div>
        </div>

        <!-- Spacer balances the top one so the board sits vertically centered -->
        <div class="flex-1"></div>
    </div>
`

class Board extends HTMLElement {
    constructor() {
        super()
    }

    connectedCallback() {
        const boardElement = htmlToElement(BOARD_HTML)

        boardElement.querySelector("#g-pause-btn").addEventListener("click", () => {
            playClickSound()
            handleGamePause()
        })

        const cellIdPattern = /^(h-\d-\d|m\d+|p\ds[1-6])$/;
        boardElement.querySelectorAll('[id^="h-"], [id^="m"], [id^="p"][id*="s"]').forEach((cell) => {
            if (!cellIdPattern.test(cell.id)) return;
            cell.addEventListener("click", () => {
                const activeInner = cell.querySelector(':scope > wc-token > .animate-bounce');
                if (!activeInner) return;
                const token = activeInner.parentElement;
                const parts = token.id.split('-');
                const playerIndex = +parts[1];
                const tokenIndex = +parts[2];
                playClickSound();
                handleOnTokenMove(playerIndex, tokenIndex);
            });
        });

        this.appendChild(boardElement)
    }
}

window.customElements.define("wc-board", Board)