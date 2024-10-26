import './style.css' // todo: check if better way to import style

let currentPlayerIndex = 0;
const positions = new Array(15).fill(-1)


document.addEventListener("DOMContentLoaded", () => {
    setInitialPosition()

    const testButton = document.getElementById("test")
    testButton.addEventListener("click", () => {
        // positions[0] += 1
        // movePiece(0)

        currentPlayerIndex = (currentPlayerIndex + 1) % 4
        moveDice()
    })
})

function setInitialPosition() {
    const params = new URLSearchParams(window.location.search)
    params.get("positions")
        ?.split(",")
        .forEach(((position, pieceIndex) => {
            positions[pieceIndex] = +position
            movePiece(pieceIndex)
        }))
}

/**
 *
 * @param {number} pieceIndex
 */
function movePiece(pieceIndex) {
    const pieceElementId = `p${pieceIndex}`;
    const targetContainerId = findTargetContainerId(pieceIndex)

    moveElement(pieceElementId, targetContainerId)
}

function moveDice() {
    const targetContainerId = `b${currentPlayerIndex}`
    moveElement("dice", targetContainerId)
}

/**
 *
 * @param {string} elementId
 * @param {string} targetContainerId
 */
function moveElement(elementId, targetContainerId) {
    const element = document.getElementById(elementId)
    const targetContainer = document.getElementById(targetContainerId)

    const initialPosition = element.getBoundingClientRect()
    const finalPosition = targetContainer.getBoundingClientRect()

    const offsetX = finalPosition.left - initialPosition.left
    const offsetY = finalPosition.top - initialPosition.top

    element.style.transform = `translate(${offsetX}px, ${offsetY}px)`
    setTimeout(() => {
        element.style.transform = `translate(0px, 0px)`
        targetContainer.appendChild(element)
    }, 1000)
}

/**
 *
 * @param {number} pieceIndex
 * @return {string}
 */
function findTargetContainerId(pieceIndex) {
    const piecePosition = positions[pieceIndex]
    if (piecePosition === -1) {
        return `h${pieceIndex}`
    }

    const playerIndex = Math.floor(pieceIndex / 4)
    if (piecePosition > 50) {
        const safeIndex = piecePosition % 50;
        return `p${playerIndex}s${safeIndex}`
    }

    const markIndex = (piecePosition + (13 * playerIndex)) % 52
    return `m${markIndex}`
}