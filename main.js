/**
 *
 * @type {number}
 */
let currentPlayerIndex = 0;

/**
 *
 * @type {number}
 */
let currentDiceRoll = 1;

/**
 *
 * @type {number[]}
 */
const positions = new Array(16).fill(-1)

/**
 * @type {number}
 */
let consecutiveSixesCount = 0

/**
 *
 * @type {boolean}
 */
let autoplay = false


document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("audio-pop").volume = 0.4

    setInitialState()

    document.getElementById("mm-start").addEventListener("click", () => {
        document.getElementById("main-menu").classList.add("hidden")
        document.getElementById("game").classList.remove("hidden")

        if (autoplay) {
            rollDice()
        }
    })

    document.getElementById("g-pause").addEventListener("click", () => {
        document.getElementById("game").classList.add("hidden")
        document.getElementById("pause-menu").classList.remove("hidden")
    })

    document.getElementById("pm-resume").addEventListener("click", () => {
        document.getElementById("pause-menu").classList.add("hidden")
        document.getElementById("game").classList.remove("hidden")
    })

    document.getElementById("pm-exit").addEventListener("click", () => {
        window.location.href = window.location.origin
    })

})


function setInitialState() {
    positions.forEach((position, pieceIndex) => {
        const token = document.createElement("wc-token")
        token.setAttribute("token-index", pieceIndex.toString())
        token.id = `p${pieceIndex}`
        document.getElementById(`h${pieceIndex}`).appendChild(token)
    })

    const params = new URLSearchParams(window.location.search)
    params.get("positions")
        ?.split(",")
        .forEach(((position, pieceIndex) => {
            positions[pieceIndex] = +position
            movePiece(pieceIndex)
        }))

    const player = params.get("player");
    if (player) {
        currentPlayerIndex = +player
        moveDice()
    }
}


export function rollDice() {
    document.getElementById("audio-pop").play()

    let counter = 0;
    const interval = setInterval(() => {
        const lastDiceRoll = currentDiceRoll


        if (counter === 6) {
            clearInterval(interval)

            const weights = [1, 2, 2, 1, 2, 2];
            const cumulativeWeights = weights.map((sum => value => sum += value)(0));
            const maxWeight = cumulativeWeights[cumulativeWeights.length - 1];
            const randomValue = Math.random() * maxWeight;
            currentDiceRoll = cumulativeWeights.findIndex(cw => randomValue < cw) + 1;

            if (currentDiceRoll === 6) {
                consecutiveSixesCount++
            }

            if (consecutiveSixesCount === 3) {
                updateCurrentPlayer()
            } else {
                animateMovablePieces()
            }
        } else {
            currentDiceRoll = (currentDiceRoll % 6) + 1
        }

        document.getElementById(`d${lastDiceRoll}`).classList.add("hidden")
        document.getElementById(`d${currentDiceRoll}`).classList.remove("hidden")

        counter++
    }, 20)
}


/**
 *
 * @param {number} pieceIndex
 * @returns {string}
 */
function getPieceElementId(pieceIndex) {
    return `p${pieceIndex}`;
}

/**
 *
 * @param {number} pieceIndex
 */
function movePiece(pieceIndex) {
    const pieceElementId = getPieceElementId(pieceIndex);
    const targetContainerId = findTargetPieceContainerId(pieceIndex)

    const element = document.getElementById(pieceElementId)
    const targetContainer = document.getElementById(targetContainerId)

    const initialPosition = element.getBoundingClientRect()
    const finalPosition = targetContainer.getBoundingClientRect()

    const offsetX = finalPosition.left - initialPosition.left
    const offsetY = finalPosition.top - initialPosition.top

    element.style.transform = `translate(${offsetX}px, ${offsetY}px)`
    setTimeout(() => {
        const previousContainer = element.parentElement

        targetContainer.appendChild(element)
        element.style.transform = `translate(0px, 0px)`
        if (targetContainer.children.length > 1) {
            element.style.marginTop = `-100%`;
        } else {
            element.style.marginTop = "0";
        }

        if (previousContainer.children.length > 0) {
            previousContainer.children[0].style.marginTop = '0';
        }
    }, 1)
}

function moveDice() {
    const targetContainerId = `b${currentPlayerIndex}`

    const diceElement = document.getElementById("wc-dice")
    const targetContainer = document.getElementById(targetContainerId)

    targetContainer.appendChild(diceElement)

    if (autoplay) {
        rollDice()
    }
}


/**
 *
 * @param {number} pieceIndex
 * @return {string}
 */
function findTargetPieceContainerId(pieceIndex) {
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

/**
 *
 * @param {number} pieceIndex
 */
function isPieceMovable(pieceIndex) {
    const piecePosition = positions[pieceIndex];

    if (currentDiceRoll === 6 && piecePosition === -1) {
        return true
    }

    return piecePosition >= 0 && (piecePosition + currentDiceRoll) <= 56
}


// todo: optimize to remove unwarranted actions during autoplay
function animateMovablePieces() {
    const movableTokenIndexes = []
    for (let pieceIndex = currentPlayerIndex * 4; pieceIndex < (currentPlayerIndex + 1) * 4; pieceIndex++) {
        if (isPieceMovable(pieceIndex)) {
            movableTokenIndexes.push(pieceIndex)
            const pieceElementId = getPieceElementId(pieceIndex)
            const pieceElement = document.getElementById(pieceElementId);
            ["animate-bounce", "z-20"].forEach(c => pieceElement.children[0].classList.add(c))
            pieceElement.addEventListener("click", updatePiecePositionAndMove)
        }
    }

    if (movableTokenIndexes.length > 0) {
        const diceElement = document.getElementById("wc-dice")
        diceElement.classList.remove("animate-bounce")
        diceElement.removeEventListener("click", rollDice)

        if (autoplay) {
            const tokenIndexPositions = movableTokenIndexes
                .map(tokenIndex => positions[tokenIndex])
            const uniqueTokenIndexPositions = new Set(tokenIndexPositions)

            if (uniqueTokenIndexPositions.size === 1) {
                const tokenElementId = getPieceElementId(movableTokenIndexes[0]);
                document.getElementById(tokenElementId).click()
            }
        }
    } else {
        updateCurrentPlayer()
    }
}

/**
 *
 * @param {number} pieceIndex
 * @returns {boolean}
 */
function captureOpponentPieces(pieceIndex) {
    const isUnsafePosition = ![0, 8, 13, 21, 26, 34, 39, 47].includes(positions[pieceIndex]) && positions[pieceIndex] < 51;
    if (isUnsafePosition) {
        const targetPieceContainerId = findTargetPieceContainerId(pieceIndex);
        const currentPlayerPieceIndexStart = currentPlayerIndex * 4;
        const piecesAlreadyThere = positions.map((position, pi) => {
            if (!(pi >= currentPlayerPieceIndexStart && pi < (currentPlayerPieceIndexStart + 4)) &&
                targetPieceContainerId === findTargetPieceContainerId(pi)
            ) {
                return pi
            }
        }).filter(pi => pi !== undefined)

        const numberOfPieceByPlayer = new Array(4).fill(0)
        piecesAlreadyThere.forEach(pi => {
            numberOfPieceByPlayer[Math.floor(pi / 4)] += 1
        })

        let captured = false
        piecesAlreadyThere.forEach(pi => {
            if (numberOfPieceByPlayer[Math.floor(pi / 4)] !== 2) {
                positions[pi] = -1
                movePiece(pi)
                captured = true
            }
        })

        if (captured) {
            document.getElementById("audio-pop").play()
        }

        return captured
    }
}

/**
 *
 * @param {PointerEvent} $event
 */
function updatePiecePositionAndMove($event) {
    document.querySelectorAll(".animate-bounce").forEach(element => {
        ["animate-bounce", "z-20"].forEach(c => element.classList.remove(c))
        element.parentElement.removeEventListener("click", updatePiecePositionAndMove)
    })

    const pieceIndex = +$event.currentTarget.id.substring(1)
    if (positions[pieceIndex] === -1) {
        positions[pieceIndex] = 0
    } else {
        positions[pieceIndex] = positions[pieceIndex] + currentDiceRoll
    }

    const capturedOpponent = captureOpponentPieces(pieceIndex);

    movePiece(pieceIndex)

    if (!capturedOpponent && currentDiceRoll !== 6) {
        updateCurrentPlayer();
    }

    const diceElement = document.getElementById("wc-dice");
    diceElement.classList.add("animate-bounce")
    diceElement.addEventListener("click", rollDice)

    if (autoplay) {
        diceElement.click()
    }
}

function updateCurrentPlayer() {
    consecutiveSixesCount = 0
    currentPlayerIndex = (currentPlayerIndex + 1) % 4
    moveDice()
}