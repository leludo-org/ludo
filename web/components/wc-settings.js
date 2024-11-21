import {
    handleAssistModeChanged,
} from "../scripts";
import {
    htmlToElement
} from "./index.js"

//language=HTML
const SETTINGS_HTML = /*html*/ `
<button id="settings-icon" class="flex items-center">
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-6">
        <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
        <circle cx="12" cy="12" r="3" />
    </svg>
</button>
<div id="settings-container" class="fixed flex flex-col bg-card p-2 gap-2 right-8 top-12 w-56 hidden">
    <h1 class="font-bold">Settings</h1>
    <div class="text-sm flex flex-col gap-4">
        <div class="flex flex-col gap-1">
            <div>Theme</div>

            <div class="grid grid-cols-3 text-center cursor-pointer gap-[1px] [&>input:checked+label]:bg-background [&>input]:hidden [&>label]:outline [&>label]:outline-1 [&>label]: outline-border [&>label]:p-1">
                <input type="radio" name="s-theme" id="theme-system" value="system" /> <label for="theme-system">System</label>
                <input type="radio" name="s-theme" id="theme-light" value="light" /> <label for="theme-light">Light</label>
                <input type="radio" name="s-theme" id="theme-dark" value="dark" /> <label for="theme-dark">Dark</label>
            </div>
        </div>
        <div class="flex justify-between gap-1">
            <label for="s-assist-mode" class="cursor-pointer">Assist Mode</label>
            <input type="checkbox" id="s-assist-mode" class="hidden [&:checked+label]:justify-end" />
            <label for="s-assist-mode" class="w-10 bg-foreground rounded-full flex items-center p-[2px] cursor-pointer">
                <div class="size-4 rounded-full bg-background">
            </label>
        </div>
    </div>
</div>
`

/**
 *
 * @param {'dark'|'light'|'system'} theme
 */
function updateTheme(theme) {
    const rootElement = window.document.documentElement
    rootElement.classList.remove("dark", "light", "system")

    // note: didn't subscribe to watch for system change yet...
    const themeToApply = theme === "system" ?
        (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? "dark" : "light") :
        theme;
    rootElement.classList.add(themeToApply)

    const navElementStyles = getComputedStyle(rootElement.querySelector("#header"));
    document.querySelector('meta[name="theme-color"]')
        .setAttribute('content', navElementStyles.backgroundColor);

    localStorage.setItem("theme", theme)
}

class Header extends HTMLElement {
    constructor() {
        super()
    }

    connectedCallback() {
        const settingsElement = htmlToElement(SETTINGS_HTML)

        const settingsIcon = settingsElement.querySelector("#settings-icon")
        const settingsContainer = settingsElement.querySelector("#settings-container")

        settingsIcon.addEventListener("click", () => {
            if (settingsContainer.classList.contains("hidden")) {
                settingsContainer.classList.remove("hidden")
            } else {
                settingsContainer.classList.add("hidden")
            }
        })

        document.addEventListener("click", ($event) => {
            const isOutsideClick = !this.contains($event.target)
            if (isOutsideClick) {
                settingsContainer.classList.add("hidden")
            }
        })


        const defaultTheme = localStorage.getItem("theme") || "system"
        updateTheme(defaultTheme)
        settingsContainer.querySelector(`#theme-${defaultTheme}`).setAttribute("checked", "checked")
        settingsContainer.querySelectorAll("input[name='s-theme']").forEach((themeSettingElement) => {
            themeSettingElement.addEventListener("change", ($event) => {
                const theme = $event.target.value;
                updateTheme(theme);
            })
        })

        const defaultAssistMode = (localStorage.getItem("assist-mode") || "false") === "true";

        if (defaultAssistMode) {
            settingsContainer.querySelector("#s-assist-mode").setAttribute("checked", "checked");
            handleAssistModeChanged(true)
        }

        settingsContainer.querySelector("#s-assist-mode").addEventListener("change", ($event) => {
            const assistMode = $event.target.checked;
            localStorage.setItem("assist-mode", assistMode);
            handleAssistModeChanged(assistMode);
        });


        this.appendChild(settingsElement)
    }
}

window.customElements.define("wc-settings", Header)