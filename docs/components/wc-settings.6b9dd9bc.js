import {
    setAssistFlag,
} from "../scripts/index.e8f102de.js";

const ASSIST_TOGGLES = [
    { id: 's-auto-roll', flag: 'autoRollDice', label: 'Auto-roll dice', storageKey: 'assist-auto-roll', default: false },
    { id: 's-auto-single', flag: 'autoMoveSingleOption', label: 'Auto-move when only one option', storageKey: 'assist-auto-single', default: false },
    { id: 's-auto-home-out', flag: 'autoMoveOutOfHome', label: 'Auto-move out of home', storageKey: 'assist-auto-home-out', default: true },
];

function readAssistPref(t) {
    const v = localStorage.getItem(t.storageKey);
    if (v === null) return t.default;
    return v === "true";
}
import {
    BOT_NAME_POOLS,
    BOT_POOL_LABELS,
    getActivePoolKey,
    setActivePoolKey,
} from "../scripts/bot-names.5b9dd5f1.js";
import {
    htmlToElement,
    VERSION,
} from "./index.bf0b1971.js"

const ICON_BACK = `<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M15 18l-6-6 6-6"/></svg>`;

const SETTINGS_HTML = /*html*/ `
<button id="settings-icon" class="w-[38px] h-[38px] rounded-full bg-transparent border border-foreground/15 flex items-center justify-center cursor-pointer opacity-70 hover:opacity-100 transition-opacity p-0">
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" width="17" height="17">
        <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
        <circle cx="12" cy="12" r="3" />
    </svg>
</button>
`;

function toggleHtml(id, label, checked = false) {
    return `<div class="flex items-center justify-between py-2.5 ${id !== 'last' ? 'border-b border-foreground/5' : ''}">
        <label for="${id}" class="text-sm cursor-pointer">${label}</label>
        <input type="checkbox" id="${id}" class="hidden peer" ${checked ? 'checked' : ''} />
        <label for="${id}" class="w-10 h-[22px] bg-foreground/20 peer-checked:bg-foreground rounded-full flex items-center p-[2px] cursor-pointer transition-all peer-checked:justify-end">
            <div class="size-[18px] rounded-full bg-background shadow-sm"></div>
        </label>
    </div>`;
}

function settingsGroup(label, content) {
    return `<div>
        <div class="text-[11px] tracking-widest uppercase opacity-40 mb-2">${label}</div>
        <div class="bg-card rounded-2xl px-3.5 border border-foreground/10">${content}</div>
    </div>`;
}

function buildSettingsOverlay() {
    return `<div id="settings-overlay" class="fixed inset-0 z-50 bg-background overflow-y-auto hidden flex items-center justify-center p-2">
        <div class="max-w-96 w-full flex flex-col min-h-[70vh]">
            <div class="flex items-center gap-2 pt-1 pb-6">
                <button id="settings-back" class="w-[38px] h-[38px] rounded-full bg-transparent border border-foreground/15 flex items-center justify-center cursor-pointer opacity-70 hover:opacity-100 transition-opacity">${ICON_BACK}</button>
                <div class="flex-1 text-center text-[11px] font-medium tracking-[0.16em] uppercase opacity-50">Settings</div>
                <div class="w-[38px]"></div>
            </div>

            <div class="flex-1 flex flex-col justify-center">
                <div class="px-3 pt-2">
                    <div class="font-display text-[40px] leading-none tracking-tight">Preferences.</div>
                </div>

                <div class="px-2 pt-4 pb-4 flex flex-col gap-6">
                ${settingsGroup('Theme', `
                    <div class="flex gap-2.5 py-2.5">
                        <label class="flex-1 cursor-pointer">
                            <input type="radio" name="s-theme" value="light" class="hidden peer" />
                            <div class="aspect-[1.4] rounded-xl p-2.5 flex flex-col justify-between border-[1.5px] border-transparent peer-checked:border-foreground" style="background:#EFE9DC;color:#1F1B14;">
                                <div class="font-display text-xl leading-none">Aa</div>
                                <div class="text-[11px]">Paper</div>
                            </div>
                        </label>
                        <label class="flex-1 cursor-pointer">
                            <input type="radio" name="s-theme" value="dark" class="hidden peer" />
                            <div class="aspect-[1.4] rounded-xl p-2.5 flex flex-col justify-between border-[1.5px] border-transparent peer-checked:border-foreground" style="background:#1F1B14;color:#F2EDE3;">
                                <div class="font-display text-xl leading-none">Aa</div>
                                <div class="text-[11px]">Dusk</div>
                            </div>
                        </label>
                        <label class="flex-1 cursor-pointer">
                            <input type="radio" name="s-theme" value="system" class="hidden peer" />
                            <div class="aspect-[1.4] rounded-xl p-2.5 flex flex-col justify-between border-[1.5px] border-transparent peer-checked:border-foreground" style="background:#0d0d0d;color:#fff;">
                                <div class="font-display text-xl leading-none">Aa</div>
                                <div class="text-[11px]">System</div>
                            </div>
                        </label>
                    </div>
                `)}

                ${settingsGroup('Assist', ASSIST_TOGGLES.map(t => toggleHtml(t.id, t.label, readAssistPref(t))).join(''))}

                ${settingsGroup('Bot vibe', `
                    <div class="flex flex-col">
                        ${Object.keys(BOT_NAME_POOLS).map((key, idx, arr) => {
                            const sample = BOT_NAME_POOLS[key].slice(0, 3).join(' · ')
                            return `<label class="flex items-center justify-between py-2.5 cursor-pointer ${idx < arr.length - 1 ? 'border-b border-foreground/5' : ''}">
                                <div class="flex flex-col gap-0.5 min-w-0 pr-3">
                                    <span class="text-sm">${BOT_POOL_LABELS[key]}</span>
                                    <span class="text-[11px] opacity-50 truncate">${sample}</span>
                                </div>
                                <input type="radio" name="s-bot-pool" value="${key}" class="hidden peer" />
                                <span class="size-[18px] rounded-full border-[1.5px] border-foreground/30 peer-checked:border-foreground peer-checked:bg-foreground shrink-0"></span>
                            </label>`
                        }).join('')}
                    </div>
                `)}

                ${settingsGroup('About', `
                    <div class="flex flex-col gap-2 py-2.5">
                        <div class="flex justify-between text-sm">
                            <span class="opacity-50">Version</span>
                            <span class="font-mono">${VERSION}</span>
                        </div>
                        <div class="flex justify-between text-sm">
                            <span class="opacity-50">Source</span>
                            <a href="https://github.com/nicOPTIONS/ludo" class="font-mono opacity-70 hover:opacity-100">github.com/leludo</a>
                        </div>
                    </div>
                `)}
                </div>
            </div>
        </div>
    </div>`;
}

function updateTheme(theme) {
    const rootElement = window.document.documentElement
    rootElement.classList.remove("dark", "light", "system")

    const themeToApply = theme === "system" ?
        (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? "dark" : "light") :
        theme;
    rootElement.classList.add(themeToApply)

    const headerEl = rootElement.querySelector("#header");
    if (headerEl) {
        const navElementStyles = getComputedStyle(headerEl);
        document.querySelector('meta[name="theme-color"]')
            .setAttribute('content', navElementStyles.backgroundColor);
    }

    localStorage.setItem("theme", theme)
}

class Header extends HTMLElement {
    constructor() {
        super()
    }

    connectedCallback() {
        const settingsElement = htmlToElement(SETTINGS_HTML)
        const settingsIcon = settingsElement.querySelector("#settings-icon")

        const overlayHTML = buildSettingsOverlay();
        document.body.insertAdjacentHTML('beforeend', overlayHTML);
        const overlay = document.getElementById('settings-overlay');

        const openSettings = () => {
            overlay.classList.remove('hidden');
        };
        const closeSettings = () => {
            overlay.classList.add('hidden');
        };

        settingsIcon.addEventListener("click", openSettings);
        overlay.querySelector("#settings-back").addEventListener("click", closeSettings);

        document.addEventListener('click', (e) => {
            if (e.target.id === 'g-settings-btn' || e.target.closest('#g-settings-btn')) {
                openSettings();
            }
        });

        const defaultTheme = localStorage.getItem("theme") || "light"
        updateTheme(defaultTheme)
        const themeRadio = overlay.querySelector(`input[name="s-theme"][value="${defaultTheme}"]`);
        if (themeRadio) themeRadio.checked = true;

        overlay.querySelectorAll("input[name='s-theme']").forEach((el) => {
            el.addEventListener("change", ($event) => {
                updateTheme($event.target.value);
            })
        })

        ASSIST_TOGGLES.forEach(t => {
            const value = readAssistPref(t);
            const el = overlay.querySelector(`#${t.id}`);
            el.checked = value;
            setAssistFlag(t.flag, value);
            el.addEventListener("change", ($event) => {
                const next = $event.target.checked;
                localStorage.setItem(t.storageKey, next);
                setAssistFlag(t.flag, next);
            });
        });

        const activePool = getActivePoolKey();
        const poolRadio = overlay.querySelector(`input[name="s-bot-pool"][value="${activePool}"]`);
        if (poolRadio) poolRadio.checked = true;
        overlay.querySelectorAll("input[name='s-bot-pool']").forEach(el => {
            el.addEventListener("change", ($event) => {
                setActivePoolKey($event.target.value);
            });
        });

        this.appendChild(settingsElement)
    }
}

window.customElements.define("wc-settings", Header)
