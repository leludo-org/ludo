import {
    htmlToElement
} from "../utils.js"

//language=HTML
const BOARD_HTML = /*html*/ `
<div class="grid grid-rows-7 grid-cols-5 gap-[1px] [&>div]:outline [&>div]:outline-1 [&>div]:outline-border">

    <div class="absolute bottom-12">
        <wc-button id="g-pause" button-text="Pause"></wc-button>

        <audio id="audio-pop">
            <source src="assets/sounds/pop.ogg" type="audio/ogg">
        </audio>
    </div>

    <div class="col-span-full grid grid-cols-3 !outline-0">

        <div id="b0" class="flex flex-col">
            <wc-dice id="wc-dice" class="w-1/3"></wc-dice>
        </div>

        <div id="b1" class="col-start-3 flex flex-col items-end"></div>
    </div>

    <div class="bg-player-0  row-span-2 col-span-2 flex items-center justify-center">
        <div class="bg-background size-4/6  grid grid-cols-2 grid-rows-2 border">
            <div class="flex items-center justify-center">
                <div id="h-0-0" class="size-1/2 rounded-full bg-player-0 border"></div>
            </div>
            <div class="flex items-center justify-center">
                <div id="h-0-1" class="size-1/2 rounded-full bg-player-0 border"></div>
            </div>
            <div class="flex items-center justify-center">
                <div id="h-0-2" class="size-1/2 rounded-full bg-player-0 border"></div>
            </div>
            <div class="flex items-center justify-center">
                <div id="h-0-3" class="size-1/2 rounded-full bg-player-0 border"></div>
            </div>
        </div>
    </div>

    <div class="-y row-span-2 grid grid-cols-3 grid-rows-6 gap-[1px] [&>div]:outline [&>div]:outline-1 [&>div]:outline-border">
        <div id="m10" class=""></div>
        <div id="m11" class="">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-player-1 corner-right-down size-full">
                <polyline points="10 15 15 20 20 15" />
                <path d="M4 4h7a4 4 0 0 1 4 4v12" />
            </svg>
        </div>
        <div id="m12" class=""></div>
        <div id="m9" class=""></div>
        <div id="p1s1" class="bg-player-1 "></div>
        <div id="m13" class="bg-player-1 "></div>
        <div id="m8" class="">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round" class="fill-player-0 star size-full">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
            </svg>
        </div>
        <div id="p1s2" class="bg-player-1 "></div>
        <div id="m14" class=""></div>
        <div id="m7" class=""></div>
        <div id="p1s3" class="bg-player-1 "></div>
        <div id="m15" class=""></div>
        <div id="m6" class=""></div>
        <div id="p1s4" class="bg-player-1 "></div>
        <div id="m16" class=""></div>
        <div id="m5" class=""></div>
        <div id="p1s5" class="bg-player-1 "></div>
        <div id="m17" class=""></div>
    </div>

    <div class="bg-player-1  row-span-2 col-span-2 flex items-center justify-center">
        <div class="bg-background size-4/6  grid grid-cols-2 grid-rows-2 border">
            <div class="flex items-center justify-center">
                <div id="h-1-0" class="size-1/2 rounded-full bg-player-1 border"></div>
            </div>
            <div class="flex items-center justify-center">
                <div id="h-1-1" class="size-1/2 rounded-full bg-player-1 border"></div>
            </div>
            <div class="flex items-center justify-center">
                <div id="h-1-2" class="size-1/2 rounded-full bg-player-1 border"></div>
            </div>
            <div class="flex items-center justify-center">
                <div id="h-1-3" class="size-1/2 rounded-full bg-player-1 border"></div>
            </div>
        </div>
    </div>

    <div class="-x col-span-2 grid grid-cols-6 grid-rows-3 gap-[1px] [&>div]:outline [&>div]:outline-1 [&>div]:outline-border">
        <div id="m51" class=""></div>
        <div id="m0" class="bg-player-0 "></div>
        <div id="m1" class=""></div>
        <div id="m2" class=""></div>
        <div id="m3" class=""></div>
        <div id="m4" class=""></div>
        <div id="m50" class="">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-player-0 corner-up-right size-full">
                <polyline points="15 14 20 9 15 4" />
                <path d="M4 20v-7a4 4 0 0 1 4-4h12" />
            </svg>
        </div>
        <div id="p0s1" class="bg-player-0 "></div>
        <div id="p0s2" class="bg-player-0 "></div>
        <div id="p0s3" class="bg-player-0 "></div>
        <div id="p0s4" class="bg-player-0 "></div>
        <div id="p0s5" class="bg-player-0 "></div>
        <div id="m49" class=""></div>
        <div id="m48" class=""></div>
        <div id="m47" class="">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round" class="fill-player-3 star size-full">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
            </svg>
        </div>
        <div id="m46" class=""></div>
        <div id="m45" class=""></div>
        <div id="m44" class=""></div>
    </div>

    <!-- todo: needs to be precise -->
    <div class="relative overflow-clip">
        <div id="p0s6" class="absolute size-full  bg-player-0 rotate-45 -translate-x-[70%] grid grid-cols-3 grid-rows-3 [&>wc-token]:-rotate-45 [&>wc-token]:col-start-3"></div>
        <div id="p1s6" class="absolute size-full  bg-player-1 rotate-45 -translate-y-[70%] grid grid-cols-3 grid-rows-3 [&>wc-token]:-rotate-45 [&>wc-token]:col-start-3 [&>wc-token]:row-start-3"></div>
        <div id="p3s6" class="absolute size-full  bg-player-3 rotate-45 translate-y-[70%] grid grid-cols-3 grid-rows-3 [&>wc-token]:-rotate-45"></div>
        <div id="p2s6" class="absolute size-full  bg-player-2 rotate-45 translate-x-[70%] grid grid-cols-3 grid-rows-3 [&>wc-token]:-rotate-45 [&>wc-token]:row-start-3"></div>
    </div>

    <div class="-x col-span-2 grid grid-cols-6 grid-rows-3 gap-[1px] [&>div]:outline [&>div]:outline-1 [&>div]:outline-border">
        <div id="m18" class=""></div>
        <div id="m19" class=""></div>
        <div id="m20" class=""></div>
        <div id="m21" class="">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round" class="fill-player-1 star size-full">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
            </svg>
        </div>
        <div id="m22" class=""></div>
        <div id="m23" class=""></div>
        <div id="p2s5" class="bg-player-2 "></div>
        <div id="p2s4" class="bg-player-2 "></div>
        <div id="p2s3" class="bg-player-2 "></div>
        <div id="p2s2" class="bg-player-2 "></div>
        <div id="p2s1" class="bg-player-2 "></div>
        <div id="m24" class="">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-player-2 corner-down-left size-full">
                <polyline points="9 10 4 15 9 20" />
                <path d="M20 4v7a4 4 0 0 1-4 4H4" />
            </svg>
        </div>
        <div id="m30" class=""></div>
        <div id="m29" class=""></div>
        <div id="m28" class=""></div>
        <div id="m27" class=""></div>
        <div id="m26" class="bg-player-2 "></div>
        <div id="m25" class=""></div>
    </div>

    <div class="bg-player-3  row-span-2 col-span-2 flex items-center justify-center">
        <div class="bg-background size-4/6  grid grid-cols-2 grid-rows-2 border">
            <div class="flex items-center justify-center">
                <div id="h-3-0" class="size-1/2 rounded-full bg-player-3 border"></div>
            </div>
            <div class="flex items-center justify-center">
                <div id="h-3-1" class="size-1/2 rounded-full bg-player-3 border"></div>
            </div>
            <div class="flex items-center justify-center">
                <div id="h-3-2" class="size-1/2 rounded-full bg-player-3 border"></div>
            </div>
            <div class="flex items-center justify-center">
                <div id="h-3-3" class="size-1/2 rounded-full bg-player-3 border"></div>
            </div>
        </div>
    </div>

    <div class="-y row-span-2 grid grid-cols-3 grid-rows-6 gap-[1px] [&>div]:outline [&>div]:outline-1 [&>div]:outline-border">
        <div id="m43" class=""></div>
        <div id="p3s5" class="bg-player-3 "></div>
        <div id="m31" class=""></div>
        <div id="m42" class=""></div>
        <div id="p3s4" class="bg-player-3 "></div>
        <div id="m32" class=""></div>
        <div id="m41" class=""></div>
        <div id="p3s3" class="bg-player-3 "></div>
        <div id="m33" class=""></div>
        <div id="m40" class=""></div>
        <div id="p3s2" class="bg-player-3 "></div>
        <div id="m34" class="">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round" class="fill-player-2 star size-full">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
            </svg>
        </div>
        <div id="m39" class="bg-player-3 "></div>
        <div id="p3s1" class="bg-player-3 "></div>
        <div id="m35" class=""></div>
        <div id="m38" class=""></div>
        <div id="m37" class="">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-player-3 corner-left-up size-full">
                <polyline points="14 9 9 4 4 9" />
                <path d="M20 20h-7a4 4 0 0 1-4-4V4" />
            </svg>
        </div>
        <div id="m36" class=""></div>
    </div>

    <div class="bg-player-2  row-span-2 col-span-2 flex items-center justify-center">
        <div class="bg-background size-4/6  grid grid-cols-2 grid-rows-2 border">
            <div class="flex items-center justify-center">
                <div id="h-2-0" class="size-1/2 rounded-full bg-player-2 border"></div>
            </div>
            <div class="flex items-center justify-center">
                <div id="h-2-1" class="size-1/2 rounded-full bg-player-2 border"></div>
            </div>
            <div class="flex items-center justify-center">
                <div id="h-2-2" class="size-1/2 rounded-full bg-player-2 border"></div>
            </div>
            <div class="flex items-center justify-center">
                <div id="h-2-3" class="size-1/2 rounded-full bg-player-2 border"></div>
            </div>
        </div>
    </div>

    <div class="col-span-full grid grid-cols-3 !outline-0">
        <div id="b3" class="flex flex-col justify-end"></div>
        <div id="b2" class="col-start-3  flex flex-col justify-end items-end"></div>
    </div>

</div>`

class Board extends HTMLElement {
    constructor() {
        super()
        const boardElement = htmlToElement(BOARD_HTML)
        this.appendChild(boardElement)
    }
}

window.customElements.define("wc-board", Board)