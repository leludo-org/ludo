import {
    htmlToElement
} from "../utils.js"

//language=HTML
const SETTINGS_HTML = /*html*/ `
<button id="settings-icon" class="flex items-center">
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-6">
        <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
        <circle cx="12" cy="12" r="3" />
    </svg>
</button>
<div id="settings-container" class="fixed flex flex-col bg-card p-2 gap-2 right-8 top-12 w-48 hidden">
    <h1>Settings</h1>
    <div class="text-sm flex justify-between">
        <label for="s-theme">Theme</label>
        <select id="s-theme" class="bg-background">
            <option value="system">System</option>
            <option value="light">Light</option>
            <option value="dark">Dark</option>
        </select>
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

        const themeSettingElement = settingsContainer.querySelector("#s-theme");
        themeSettingElement.addEventListener("change", ($event) => {
            const theme = $event.target.value;
            updateTheme(theme);
            settingsIcon.click() // todo: should close on outside click instead
        })

        themeSettingElement.value = localStorage.getItem("theme") || "system"
        updateTheme(themeSettingElement.value)

        this.appendChild(settingsElement)
    }
}

window.customElements.define("wc-settings", Header)