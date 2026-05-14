export const VERSION = "0.6.0";

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