export const VERSION = "0.4.6";

/**
 *
 * @param {string} html
 * @returns {HTMLElement}
 */
export function htmlToElement(html) {
    const element = document.createElement('template')
    element.innerHTML = html
    return element.content
}