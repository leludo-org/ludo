import './style.css' // todo: check if better way to import style

document.addEventListener("DOMContentLoaded", () => {
    const testButton = document.getElementById("test");
    testButton.addEventListener("click", () => {
        movePlayerPiece(1,1);
    });
});

/**
 *
 * @param {1|2|3|4} player
 * @param {1|2|3|4} piece
 */
function movePlayerPiece(player, piece) {
    const pieceElement = document.getElementById(`p${player}-p${piece}`);
    const initialPosition = pieceElement.getBoundingClientRect();

    const targetContainer = document.getElementById("m0");
    const finalPosition = targetContainer.getBoundingClientRect();

    const offsetX = finalPosition.left - initialPosition.left;
    const offsetY = finalPosition.top - initialPosition.top;

    pieceElement.style.transform = `translate(${offsetX}px, ${offsetY}px)`;
    setTimeout(() => {
        pieceElement.style.transform = `translate(0px, 0px)`;
        targetContainer.appendChild(pieceElement);
    }, 1000)
}