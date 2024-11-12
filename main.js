import {gameState, publishGameEvent} from "./game-events.js"
import {isTokenMovable} from "./game-logic.js";
import {getTokenContainerId} from "./render-logic.js";


document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("audio-pop").volume = 0.6

    document.querySelectorAll(".quick-start").forEach((el) => {
        const quickStartId = el.id

        el.addEventListener("click", () => {
            gameState.initPlayers(quickStartId)
            setInitialState()

            document.getElementById("main-menu").classList.add("hidden")
            document.getElementById("game").classList.remove("hidden")

            if (gameState.isAutoplay()) {
                rollDice()
            }
        })
    })

    document.getElementById("g-pause").addEventListener("click", () => {
        document.getElementById("game").classList.add("hidden")
        document.getElementById("pause-menu").classList.remove("hidden")
    })

    document.getElementById("pm-resume").addEventListener("click", () => {
        document.getElementById("pause-menu").classList.add("hidden")
        document.getElementById("game").classList.remove("hidden")
    })

    document.querySelectorAll(".restart-game").forEach(el => {
        el.addEventListener("click", () => {
            window.location.href = window.location.origin
        })
    })

})


/**
 *
 * @param {number} playerIndex
 * @param {number} tokenIndex
 * @returns {string}
 */
function getTokenElementId(playerIndex, tokenIndex) {
    return `p-${playerIndex}-${tokenIndex}`;
}

function setInitialState() {
    const params = new URLSearchParams(window.location.search)
    const initPositions = params.get("positions")?.split(",")

    gameState.playerStates.forEach((playerState, playerIndex) => {
        if (playerState) {
            playerState.tokenPositions.forEach((tokenPosition, tokenIndex) => {
                const token = document.createElement("wc-token")
                token.setAttribute("id", getTokenElementId(playerIndex, tokenIndex))
                document.getElementById(`h-${playerIndex}-${tokenIndex}`).appendChild(token)

                if (initPositions && initPositions[(playerIndex * 4) + tokenIndex] !== undefined) {
                    playerState.tokenPositions[tokenIndex] = +initPositions[(playerIndex * 4) + tokenIndex]
                    moveToken(token.id)
                }
            })
        }
    })

    const player = params.get("player");
    if (player) {
        gameState.currentPlayerIndex = +player
    }

    publishGameEvent("PLAYER_UPDATED")
}


export function rollDice() {
    document.getElementById("audio-pop").play()

    let counter = 0;
    const interval = setInterval(() => {
        const lastDiceRoll = gameState.currentDiceRoll


        if (counter === 6) {
            clearInterval(interval)

            const weights = [1, 2, 2, 1, 2, 2];
            const cumulativeWeights = weights.map((sum => value => sum += value)(0));
            const maxWeight = cumulativeWeights[cumulativeWeights.length - 1];
            const randomValue = Math.random() * maxWeight;
            gameState.currentDiceRoll = cumulativeWeights.findIndex(cw => randomValue < cw) + 1;

            if (gameState.currentDiceRoll === 6) {
                gameState.consecutiveSixesCount++
            }

            if (gameState.consecutiveSixesCount === 3) {
                gameState.updateCurrentPlayer()
            } else {
                animateMovablePieces()
            }
        } else {
            gameState.currentDiceRoll = (gameState.currentDiceRoll % 6) + 1
        }

        document.getElementById(`d${lastDiceRoll}`).classList.add("hidden")
        document.getElementById(`d${gameState.currentDiceRoll}`).classList.remove("hidden")

        counter++
    }, 20)
}

/**
 *
 * @param {string} tokenElementId
 */
function moveToken(tokenElementId) {
    const tokenIdTokens = tokenElementId.split("-")
    const playerIndex = +tokenIdTokens[1];
    const tokenIndex = +tokenIdTokens[2];

    const tokenPosition = gameState.playerStates[playerIndex].tokenPositions[tokenIndex]
    const targetContainerId = getTokenContainerId(playerIndex, tokenIndex, tokenPosition)

    const element = document.getElementById(tokenElementId)
    const targetContainer = document.getElementById(targetContainerId)

    const previousContainer = element.parentElement

    targetContainer.appendChild(element)
    if (targetContainer.children.length > 1) {
        element.style.marginTop = `-100%`;
    } else {
        element.style.marginTop = "0";
    }

    if (previousContainer.children.length > 0) {
        previousContainer.children[0].style.marginTop = '0';
    }
}


// todo: optimize to remove unwarranted actions during autoplay
function animateMovablePieces() {
    const movableTokenElementIds = []

    gameState.getCurrentPlayerTokenPositions().forEach((tokenPosition, tokenIndex) => {
        if (isTokenMovable(tokenPosition, gameState.currentDiceRoll)) {
            const tokenElementId = getTokenElementId(gameState.currentPlayerIndex, tokenIndex)

            const tokenElement = document.getElementById(tokenElementId);
            ["animate-bounce", "z-20"].forEach(c => tokenElement.children[0].classList.add(c))
            tokenElement.addEventListener("click", updatePiecePositionAndMove)

            movableTokenElementIds.push(tokenElementId)
        }
    })


    if (movableTokenElementIds.length > 0) {
        const diceElement = document.getElementById("wc-dice")
        diceElement.classList.remove("animate-bounce")
        diceElement.removeEventListener("click", rollDice)

        if (gameState.isCurrentPlayerBot()) {
            // todo: make bot smarter
            document.getElementById(movableTokenElementIds[movableTokenElementIds.length - 1]).click()
        } else if (gameState.autoplay) {
            // const tokenIndexPositions = movableTokenElementIds
            //     .map(tokenIndex => gameState.playerStates[Math.floor(tokenIndex / 4)][tokenIndex % 4])
            // const uniqueTokenIndexPositions = new Set(tokenIndexPositions)
            //
            // if (uniqueTokenIndexPositions.size === 1) {
            //     const tokenElementId = getPieceElementId(movableTokenElementIds[0]);
            //     document.getElementById(tokenElementId).click()
            // }
        }
    } else {
        gameState.updateCurrentPlayer()
    }
}

/**
 *
 * @param {number} currentPlayerIndex
 * @param {number} currentTokenIndex
 * @returns {boolean}
 */
function captureOpponentPieces(currentPlayerIndex, currentTokenIndex) {
    const tokenPosition = gameState.playerStates[currentPlayerIndex].tokenPositions[currentTokenIndex]
    const isUnsafePosition = ![0, 8, 13, 21, 26, 34, 39, 47].includes(tokenPosition) && tokenPosition < 51;
    if (isUnsafePosition) {
        const targetPieceContainerId = getTokenContainerId(currentPlayerIndex, currentTokenIndex, tokenPosition);
        const piecesAlreadyThere = [];

        gameState.playerStates.forEach((playerState, playerIndex) => {
            if (playerIndex !== currentPlayerIndex && playerState) {
                playerState.tokenPositions.forEach((tokenPosition, tokenIndex) => {
                    if (targetPieceContainerId === getTokenContainerId(playerIndex, tokenIndex, tokenPosition)) {
                        piecesAlreadyThere.push(getTokenElementId(playerIndex, tokenIndex))
                    }
                })
            }
        })

        const numberOfPieceByPlayer = new Array(4).fill(0)
        piecesAlreadyThere.forEach(pi => {
            numberOfPieceByPlayer[+pi.split("-")[1]] += 1
        })

        let captured = false
        piecesAlreadyThere.forEach(pi => {
            if (numberOfPieceByPlayer[+pi.split("-")[1]] !== 2) {
                gameState.playerStates[+pi.split("-")[1]].tokenPositions[+pi.split("-")[2]] = -1
                moveToken(pi)
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

    const tokenElementIdTokens = $event.currentTarget.id.split("-")
    const playerIndex = +tokenElementIdTokens[1]
    const tokenIndex = +tokenElementIdTokens[2]


    if (gameState.getCurrentPlayerTokenPositions()[tokenIndex] === -1) {
        gameState.getCurrentPlayerTokenPositions()[tokenIndex] = 0
    } else {
        gameState.getCurrentPlayerTokenPositions()[tokenIndex] = gameState.getCurrentPlayerTokenPositions()[tokenIndex] + gameState.currentDiceRoll
    }

    const isTripComplete = gameState.getCurrentPlayerTokenPositions()[tokenIndex] === 56

    // todo: no need to check if position is one of the safe position
    const capturedOpponent = captureOpponentPieces(playerIndex, tokenIndex);

    moveToken($event.currentTarget.id)

    if (isTripComplete && gameState.playerStates[gameState.currentPlayerIndex].isFinished()) {
        let numberOfRemainingPlayers = 0;
        gameState.playerStates.forEach((playerState) => {
            if (playerState && !playerState.isFinished()) {
                numberOfRemainingPlayers++;
            }
        })

        if (numberOfRemainingPlayers === 1) {
            document.getElementById("game-end").classList.remove("hidden")
            document.getElementById("game").classList.add("hidden")
        }
    }

    const diceElement = document.getElementById("wc-dice");
    diceElement.classList.add("animate-bounce")
    diceElement.addEventListener("click", rollDice)

    if (!isTripComplete && !capturedOpponent && gameState.currentDiceRoll !== 6) {
        gameState.updateCurrentPlayer();
    } else {
        if (gameState.isAutoplay()) {
            diceElement.click()
        }
    }
}