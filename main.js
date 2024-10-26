import './style.css' // todo: check if better way to import style

const positions = new Array(15).fill(-1)


document.addEventListener("DOMContentLoaded", () => {
    setInitialPosition()

    const testButton = document.getElementById("test")
    testButton.addEventListener("click", () => {
        positions[12] += 4
        movePiece(12)
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
    const pieceElement = document.getElementById(`p${pieceIndex}`)
    const initialPosition = pieceElement.getBoundingClientRect()

    const targetContainerId = findTargetContainerId(pieceIndex)
    const targetContainer = document.getElementById(targetContainerId)
    const finalPosition = targetContainer.getBoundingClientRect()

    const offsetX = finalPosition.left - initialPosition.left
    const offsetY = finalPosition.top - initialPosition.top

    pieceElement.style.transform = `translate(${offsetX}px, ${offsetY}px)`
    setTimeout(() => {
        pieceElement.style.transform = `translate(0px, 0px)`
        targetContainer.appendChild(pieceElement)
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