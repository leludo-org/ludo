import {
    htmlToElement
} from "./utils.2bc2f3b2.js"

// Brand mark · Direction F · The Board. Mini board silhouette — 3×3 grid
// of colored home quadrants + washed cross arms + central rosette. Reads
// as "Ludo" even at 24px.
const BRAND_MARK = /*html*/ `
<svg viewBox="0 0 96 96" class="w-7 h-7 shrink-0" aria-hidden="true">
    <rect width="96" height="96" rx="6" fill="#FAF6EC"/>
    <rect x="32" y="0"  width="32" height="32" fill="#F0DDA0"/>
    <rect x="64" y="32" width="32" height="32" fill="#C9E1D2"/>
    <rect x="32" y="64" width="32" height="32" fill="#C5D5E8"/>
    <rect x="0"  y="32" width="32" height="32" fill="#ECCBBA"/>
    <rect x="0"  y="0"  width="32" height="32" fill="#C8472E"/>
    <rect x="64" y="0"  width="32" height="32" fill="#D7A21F"/>
    <rect x="0"  y="64" width="32" height="32" fill="#3253A8"/>
    <rect x="64" y="64" width="32" height="32" fill="#3D8A5E"/>
    <path d="M48 48 L48 34.56 L61.44 48 Z" fill="#D7A21F"/>
    <path d="M48 48 L61.44 48 L48 61.44 Z" fill="#3D8A5E"/>
    <path d="M48 48 L48 61.44 L34.56 48 Z" fill="#3253A8"/>
    <path d="M48 48 L34.56 48 L48 34.56 Z" fill="#C8472E"/>
    <rect x="0.5" y="0.5" width="95" height="95" rx="6" fill="none" stroke="#1F1B14" stroke-opacity="0.18"/>
</svg>`

//language=HTML
const HEADER_HTML = /*html*/ `
<nav id="header" class="px-4 py-2 gap-2 h-14 flex justify-between items-center bg-card border-b border-border/20 shadow-sm">
    <a href="/" class="flex items-center gap-2.5 text-foreground no-underline">
        ${BRAND_MARK}
        <span class="font-display italic text-3xl leading-none tracking-tight">leludo</span>
    </a>
    <div class="flex gap-3 items-center">
        <wc-settings></wc-settings>
        <a href="https://github.com/leludo-org/ludo">
            <svg aria-hidden="true" viewBox="0 0 24 24" version="1.1" data-view-component="true" class="size-6 fill-foreground">
                <path d="M12.5.75C6.146.75 1 5.896 1 12.25c0 5.089 3.292 9.387 7.863 10.91.575.101.79-.244.79-.546 0-.273-.014-1.178-.014-2.142-2.889.532-3.636-.704-3.866-1.35-.13-.331-.69-1.352-1.18-1.625-.402-.216-.977-.748-.014-.762.906-.014 1.553.834 1.769 1.179 1.035 1.74 2.688 1.25 3.349.948.1-.747.402-1.25.733-1.538-2.559-.287-5.232-1.279-5.232-5.678 0-1.25.445-2.285 1.178-3.09-.115-.288-.517-1.467.115-3.048 0 0 .963-.302 3.163 1.179.92-.259 1.897-.388 2.875-.388.977 0 1.955.13 2.875.388 2.2-1.495 3.162-1.179 3.162-1.179.633 1.581.23 2.76.115 3.048.733.805 1.179 1.825 1.179 3.09 0 4.413-2.688 5.39-5.247 5.678.417.36.776 1.05.776 2.128 0 1.538-.014 2.774-.014 3.162 0 .302.216.662.79.547C20.709 21.637 24 17.324 24 12.25 24 5.896 18.854.75 12.5.75Z">
                </path>
            </svg>
        </a>
    </div>
</nav>
`

class Header extends HTMLElement {
    constructor() {
        super()
        const headerElement = htmlToElement(HEADER_HTML)
        this.appendChild(headerElement)

    }
}

window.customElements.define("wc-header", Header)
