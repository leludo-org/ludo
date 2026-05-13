import {
    htmlToElement
} from "./index.js"
import {handleGamePause, playClickSound} from "../scripts/index.js";

//language=HTML
const STAR_D = "M12 2.2l2.8 6.3 6.8.5-5.2 4.4 1.6 6.6L12 16.6l-6 3.4 1.6-6.6L2.4 9l6.8-.5z";
const ARROW_D = "M6 1.5L2.5 5h2v5.5h3V5h2z";

const startCellSvg = (playerClass, arrowRot) => `
    <svg viewBox="0 0 24 24" class="size-[78%] pointer-events-none absolute inset-0 m-auto"><path d="${STAR_D}" class="${playerClass}"/></svg>
    <svg viewBox="0 0 12 12" class="size-[28%] pointer-events-none absolute top-[4%] right-[4%]" style="transform:rotate(${arrowRot}deg)"><path d="${ARROW_D}" class="${playerClass}" opacity="0.7"/></svg>`;

const safeCellSvg = `
    <svg viewBox="0 0 24 24" class="size-[72%] pointer-events-none absolute inset-0 m-auto"><path d="${STAR_D}" fill="hsl(var(--foreground))" opacity="0.55"/></svg>`;

const SC = "relative"; // cell base class for stacking

//language=HTML
const BOARD_HTML = /*html*/ `
    <div class="flex flex-col">
        <!-- Top bar -->
        <div class="flex items-center px-3 pt-3 pb-10 gap-2">
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

        <!-- Hidden home for wc-dice when no active corner has it yet -->
        <div id="dice-home" class="hidden"><wc-dice id="wc-dice"></wc-dice></div>

        <!-- Top corner row (seats 0/1, rotated 180°) -->
        <div id="corner-row-top" class="flex justify-between items-start px-3 pt-2 gap-2" style="min-height:56px;">
            <div id="b0" class="empty:hidden"></div>
            <div id="b1" class="empty:hidden"></div>
        </div>

        <!-- Board -->
        <div class="flex-1 flex items-center justify-center px-3 pt-3">
            <div class="relative w-full">
                <div class="grid grid-rows-5 grid-cols-5 gap-0 overflow-clip rounded-xl aspect-square w-full" style="box-shadow: 0 14px 40px -10px rgba(31,27,20,0.22), 0 2px 6px rgba(31,27,20,0.06), inset 0 0 0 1px rgba(31,27,20,0.06);">

            <div class="bg-player-0 row-span-2 col-span-2 flex items-center justify-center">
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
                <div id="m11" class="${SC}"></div>
                <div id="m12" class="${SC}"></div>
                <div id="m9" class="${SC}"></div>
                <div id="p1s1" class="bg-player-1-path ${SC}"></div>
                <div id="m13" class="bg-player-1-path relative flex items-center justify-center ${SC}">${startCellSvg('fill-player-1', 180)}</div>
                <div id="m8" class="bg-safe-tint relative flex items-center justify-center ${SC}">${safeCellSvg}</div>
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

            <div class="bg-player-1 row-span-2 col-span-2 flex items-center justify-center">
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
                <div id="m0" class="bg-player-0-path relative flex items-center justify-center ${SC}">${startCellSvg('fill-player-0', 90)}</div>
                <div id="m1" class="${SC}"></div>
                <div id="m2" class="${SC}"></div>
                <div id="m3" class="${SC}"></div>
                <div id="m4" class="${SC}"></div>
                <div id="m50" class="${SC}"></div>
                <div id="p0s1" class="bg-player-0-path ${SC}"></div>
                <div id="p0s2" class="bg-player-0-path ${SC}"></div>
                <div id="p0s3" class="bg-player-0-path ${SC}"></div>
                <div id="p0s4" class="bg-player-0-path ${SC}"></div>
                <div id="p0s5" class="bg-player-0-path ${SC}"></div>
                <div id="m49" class="${SC}"></div>
                <div id="m48" class="${SC}"></div>
                <div id="m47" class="bg-safe-tint relative flex items-center justify-center ${SC}">${safeCellSvg}</div>
                <div id="m46" class="${SC}"></div>
                <div id="m45" class="${SC}"></div>
                <div id="m44" class="${SC}"></div>
            </div>

            <div class="relative overflow-clip bg-board-cell">
                <div id="p0s6"
                     class="absolute size-full bg-player-0-path rotate-45 -translate-x-[70%] grid grid-cols-3 grid-rows-3 [&>wc-token]:-rotate-45 [&>wc-token]:col-start-3 [&>wc-token:nth-of-type(2)]:mt-[-200%] [&>wc-token:nth-of-type(3)]:mt-[-400%] [&>wc-token:nth-of-type(4)]:mt-[-500%]"></div>
                <div id="p1s6"
                     class="absolute size-full bg-player-1-path rotate-45 -translate-y-[70%] grid grid-cols-3 grid-rows-3 [&>wc-token]:-rotate-45 [&>wc-token]:col-start-3 [&>wc-token]:row-start-3"></div>
                <div id="p3s6"
                     class="absolute size-full bg-player-3-path rotate-45 translate-y-[70%] grid grid-cols-3 grid-rows-3 [&>wc-token]:-rotate-45 [&>wc-token:nth-of-type(2)]:ml-[-200%] [&>wc-token:nth-of-type(3)]:ml-[-400%] [&>wc-token:nth-of-type(4)]:mt-[-200%]"></div>
                <div id="p2s6"
                     class="absolute size-full bg-player-2-path -rotate-45 translate-x-[70%] grid grid-cols-3 grid-rows-3 [&>wc-token]:rotate-45 [&>wc-token:nth-of-type(2)]:ml-[-200%] [&>wc-token:nth-of-type(3)]:ml-[-400%] [&>wc-token:nth-of-type(4)]:mt-[-200%]"></div>
            </div>

            <div class="-x col-span-2 grid grid-cols-6 grid-rows-3 [&>div]:outline [&>div]:outline-1 [&>div]:outline-board-border/40">
                <div id="m18" class="${SC}"></div>
                <div id="m19" class="${SC}"></div>
                <div id="m20" class="${SC}"></div>
                <div id="m21" class="bg-safe-tint relative flex items-center justify-center ${SC}">${safeCellSvg}</div>
                <div id="m22" class="${SC}"></div>
                <div id="m23" class="${SC}"></div>
                <div id="p2s5" class="bg-player-2-path ${SC}"></div>
                <div id="p2s4" class="bg-player-2-path ${SC}"></div>
                <div id="p2s3" class="bg-player-2-path ${SC}"></div>
                <div id="p2s2" class="bg-player-2-path ${SC}"></div>
                <div id="p2s1" class="bg-player-2-path ${SC}"></div>
                <div id="m24" class="${SC}"></div>
                <div id="m30" class="${SC}"></div>
                <div id="m29" class="${SC}"></div>
                <div id="m28" class="${SC}"></div>
                <div id="m27" class="${SC}"></div>
                <div id="m26" class="bg-player-2-path relative flex items-center justify-center ${SC}">${startCellSvg('fill-player-2', 270)}</div>
                <div id="m25" class="${SC}"></div>
            </div>

            <div class="bg-player-3 row-span-2 col-span-2 flex items-center justify-center">
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
                <div id="m34" class="bg-safe-tint relative flex items-center justify-center ${SC}">${safeCellSvg}</div>
                <div id="m39" class="bg-player-3-path relative flex items-center justify-center ${SC}">${startCellSvg('fill-player-3', 0)}</div>
                <div id="p3s1" class="bg-player-3-path ${SC}"></div>
                <div id="m35" class="${SC}"></div>
                <div id="m38" class="${SC}"></div>
                <div id="m37" class="${SC}"></div>
                <div id="m36" class="${SC}"></div>
            </div>

            <div class="bg-player-2 row-span-2 col-span-2 flex items-center justify-center">
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
        </div>

        <!-- Bottom corner row (seats 3/2, upright) -->
        <div id="corner-row-bottom" class="flex justify-between items-end px-3 pt-3 pb-2 gap-2" style="min-height:56px;">
            <div id="b3" class="empty:hidden"></div>
            <div id="b2" class="empty:hidden"></div>
        </div>
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

        this.appendChild(boardElement)
    }
}

window.customElements.define("wc-board", Board)