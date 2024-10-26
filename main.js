import './style.css' // todo: check if better way to import style

const positions = new Array(15).fill(-1);


document.addEventListener("DOMContentLoaded", () => {
    setInitialPosition()

    const testButton = document.getElementById("test");
    testButton.addEventListener("click", () => {
        movePiece(0);
    });
});

function setInitialPosition() {
    const params = new URLSearchParams(window.location.search);
    params.get("positions")
        ?.split(",")
        .forEach(((p, index) => {
            positions[index] = +p
            movePiece(index)
        }))
}

/**
 *
 * @param {number} piece
 */
function movePiece(piece) {
    const pieceElement = document.getElementById(`p${piece}`);
    const initialPosition = pieceElement.getBoundingClientRect();

    const targetContainer = document.getElementById("m0");
    const finalPosition = targetContainer.getBoundingClientRect();

    const offsetX = finalPosition.left - initialPosition.left;
    const offsetY = finalPosition.top - initialPosition.top;

    pieceElement.style.transform = `translate(${offsetX}px, ${offsetY}px)`;
    setTimeout(() => {
        pieceElement.style.transform = `translate(0px, 0px)`;
        targetContainer.appendChild(pieceElement);
        z
    }, 1000)
}