import {
    activateDice,
    activateToken,
    animateDiceRoll,
    findCapturedOpponents,
    generateDiceRoll, getBestPossibleTokenIndexForMove,
    applyColorMap, getPlayerTypes,
    getTokenContainerId,
    getTokenElementId,
    getTokenNewPosition, getUniqueTokenPositions,
    inactiveDice,
    inactiveTokens,
    isTokenMovable,
    isTripComplete,
    moveDice,
    playCaptureSound,
    playClickSound,
    resumeGame,
    showGame,
    showPauseMenu,
    slideBackToMenu,
    updateDiceFace,
    updateTokenContainer,
    updateActionZone,
    updateTurnCounter,
    resetTurnCount,
    initRailDeps,
    setPlayerNames,
} from "./index.e8f102de.js";

/**
 * @typedef {'PLAYER'|'BOT'} PlayerType
 */

let currentPlayerIndex = 2;
let currentDiceRoll = 1;
let consecutiveSixesCount = 0
const assistFlags = {
    autoRollDice: false,
    autoMoveSingleOption: false,
    autoMoveOutOfHome: true,
}
let gameStartedAt = new Date().getTime()
let lastRank = 0

/**
 *
 * @type {PlayerType[]}
 */
export const playerTypes = new Array(4)
/**
 *
 * @type {number[]}
 */
export const playerRanks = new Array(4).fill(0)
/**
 *
 * @type {number[]}
 */
export const playerTimes = new Array(4).fill(0)
/**
 *
 * @type {number[]}
 */
export const playerCaptures = new Array(4).fill(0)
/**
 *
 * @type {string[]}
 */
export const playerNames = new Array(4).fill('')
/**
 *
 * @type {number[][]}
 */
const playerTokenPositions = new Array(4);


export function getCurrentPlayerIndex() { return currentPlayerIndex }
export function getIsLocalMultiplayer() {
    let humans = 0, defined = 0;
    for (let i = 0; i < 4; i++) {
        if (playerTypes[i]) defined++;
        if (playerTypes[i] === 'PLAYER') humans++;
    }
    return defined >= 2 && humans === defined;
}
export function getFinishedCount(playerIndex) {
    if (!playerTokenPositions[playerIndex]) return 0;
    return playerTokenPositions[playerIndex].filter(p => p === 56).length;
}

/**
 *
 * @returns {boolean}
 */
function isCurrentPlayerBot() {
    return playerTypes[currentPlayerIndex] === "BOT"
}

/**
 *
 * @returns {boolean}
 */
function isAutoplay() {
    return assistFlags.autoRollDice || isCurrentPlayerBot()
}

function allTokensInHome(playerIndex) {
    return playerTokenPositions[playerIndex].every(p => p === -1)
}

/**
 *
 * @param {string} quickStartId
 */
function initPlayers(quickStartId) {
    const result = getPlayerTypes(quickStartId)
    result.playerTypes.forEach((playerType, playerIndex) => {
        playerTypes[playerIndex] = playerType
        playerTokenPositions[playerIndex] = new Array(4).fill(-1)
    })
    applyColorMap(result.colorMap)
}

/**
 * @param {number} playerIndex
 * @returns {boolean}
 */
function isPlayerFinished(playerIndex) {
    return playerTokenPositions[playerIndex].find(tp => tp !== 56) === undefined
}

function updateCurrentPlayer() {
    consecutiveSixesCount = 0

    do {
        currentPlayerIndex = (currentPlayerIndex + 1) % 4
    } while (playerTypes[currentPlayerIndex] === undefined || isPlayerFinished(currentPlayerIndex))

    updateTurnCounter()
    handlePayerUpdated()
}


/**
 *
 * @param {string} quickStartId
 */
export function handleGameStart(quickStartId, namesByPlayerIndex) {
    _quickStartId = quickStartId;
    gameStartedAt = new Date().getTime()
    resetTurnCount()
    initRailDeps(playerTypes, getCurrentPlayerIndex, getFinishedCount, getIsLocalMultiplayer)

    initPlayers(quickStartId)

    for (let i = 0; i < 4; i++) {
        playerNames[i] = (namesByPlayerIndex && namesByPlayerIndex[i]) || ''
    }
    setPlayerNames(playerNames)

    currentPlayerIndex = playerTypes.includes("PLAYER")
        ? 2
        : playerTypes.findIndex(t => t !== undefined)

    showGame();

    const params = new URLSearchParams(window.location.search)
    const initPositions = params.get("positions")?.split(",")

    playerTypes.forEach((playerType, playerIndex) => {
        if (playerType) {
            playerTokenPositions[playerIndex].forEach((tokenPosition, tokenIndex) => {
                const token = document.createElement("wc-token")
                token.setAttribute("id", getTokenElementId(playerIndex, tokenIndex))
                document.getElementById(`h-${playerIndex}-${tokenIndex}`).appendChild(token)

                if (initPositions && initPositions[(playerIndex * 4) + tokenIndex] !== undefined) {
                    playerTokenPositions[playerIndex][tokenIndex] = +initPositions[(playerIndex * 4) + tokenIndex]
                    updateTokenContainer(playerIndex, tokenIndex, -1, playerTokenPositions[playerIndex][tokenIndex]).then()
                }
            })
        }
    })

    const player = params.get("player");
    if (player) {
        currentPlayerIndex = +player
    }

    moveDice(currentPlayerIndex)
    handleDiceMoved()
}


export function handleGamePause() {
    showPauseMenu();

    document.getElementById("pm-resume").addEventListener("click", () => {
        playClickSound()
        resumeGame()
    }, { once: true })

    document.querySelectorAll(".restart-game").forEach(el => {
        el.addEventListener("click", async () => {
            playClickSound()
            await slideBackToMenu()
            window.location.href = window.location.origin
        })
    })
}


export function handlePayerUpdated() {
    moveDice(currentPlayerIndex)
    handleDiceMoved()
}


export function handleDiceRoll() {
    updateActionZone('rolling');
    animateDiceRoll(currentDiceRoll)
        .then(() => {
            const lastDiceRoll = currentDiceRoll
            currentDiceRoll = generateDiceRoll();

            updateDiceFace(lastDiceRoll, currentDiceRoll);

            if (currentDiceRoll === 6) {
                consecutiveSixesCount++
            }

            handleAfterDiceRoll()
        });
}

function handleAfterDiceRoll() {
    if (consecutiveSixesCount === 3) {
        updateCurrentPlayer();
    } else {
        const movableTokenIndexes = [];

        playerTokenPositions[currentPlayerIndex].forEach((tokenPosition, tokenIndex) => {
            if (isTokenMovable(tokenPosition, currentDiceRoll)) {
                activateToken(currentPlayerIndex, tokenIndex);
                movableTokenIndexes.push(tokenIndex);
            }
        })


        if (movableTokenIndexes.length > 0) {
            inactiveDice();
            updateActionZone('select', currentDiceRoll);

            if (isCurrentPlayerBot()) {
                setTimeout(() => {
                    const uniqueTokenIndexPositions = getUniqueTokenPositions(currentPlayerIndex, movableTokenIndexes, playerTokenPositions);
                    if (uniqueTokenIndexPositions.size === 1) {
                        handleOnTokenMove(currentPlayerIndex, movableTokenIndexes[0]);
                    } else {
                        const bestMoveTokenIndex = getBestPossibleTokenIndexForMove(currentPlayerIndex, movableTokenIndexes, currentDiceRoll, playerTokenPositions);
                        handleOnTokenMove(currentPlayerIndex, bestMoveTokenIndex);
                    }
                }, 400);
            } else {
                const uniqueTokenIndexPositions = getUniqueTokenPositions(currentPlayerIndex, movableTokenIndexes, playerTokenPositions);
                const singleOption = uniqueTokenIndexPositions.size === 1;
                const onlyHomeOut = allTokensInHome(currentPlayerIndex) && currentDiceRoll === 6;
                if ((assistFlags.autoMoveSingleOption && singleOption) ||
                    (assistFlags.autoMoveOutOfHome && onlyHomeOut)) {
                    handleOnTokenMove(currentPlayerIndex, movableTokenIndexes[0]);
                }
            }
        } else {
            updateCurrentPlayer();
        }
    }
}


/**
 *
 * @param {number} playerIndex
 * @param {number} tokenIndex
 */
export async function handleOnTokenMove(playerIndex, tokenIndex) {
    inactiveTokens();

    const tokenOldPosition = playerTokenPositions[currentPlayerIndex][tokenIndex]
    const tokenNewPosition = getTokenNewPosition(playerTokenPositions[currentPlayerIndex][tokenIndex], currentDiceRoll)
    playerTokenPositions[currentPlayerIndex][tokenIndex] = tokenNewPosition

    const tripComplete = isTripComplete(tokenNewPosition)

    await updateTokenContainer(playerIndex, tokenIndex, tokenOldPosition, tokenNewPosition)

    const otherPlayerTokensOnThatMarkIndex = findCapturedOpponents(playerIndex, playerTokenPositions[playerIndex][tokenIndex], playerTokenPositions);
    let captureCount = 0

    for (const [pi, pt] of otherPlayerTokensOnThatMarkIndex.entries()) {
        for (const ti of pt) {
            playCaptureSound()
            const capturedToken = document.getElementById(`p-${pi}-${ti}`);
            const capturedSvg = capturedToken?.children[0];
            if (capturedSvg) {
                capturedSvg.classList.add("token-captured");
                await new Promise(r => setTimeout(r, 500));
                capturedSvg.classList.remove("token-captured");
            }
            await updateTokenContainer(pi, ti, playerTokenPositions[pi][ti], -1)
            playerTokenPositions[pi][ti] = -1
            captureCount++
        }
    }

    if (captureCount > 0) {
        playerCaptures[currentPlayerIndex] += captureCount
        const board = document.getElementById("game");
        board.classList.add("board-shake");
        board.addEventListener("animationend", () => board.classList.remove("board-shake"), { once: true });
    }

    handleAfterTokenMove(tripComplete, captureCount)
}


/**
 *
 * @param {boolean} tripComplete
 * @param {number} captureCount
 */
function handleAfterTokenMove(tripComplete, captureCount) {
    let isGameDone = false;
    if (tripComplete && isPlayerFinished(currentPlayerIndex)) {
        playerRanks[currentPlayerIndex] = ++lastRank
        playerTimes[currentPlayerIndex] = new Date().getTime() - gameStartedAt

        let numberOfRemainingPlayers = 0;
        playerTypes.forEach((playerType, playerIndex) => {
            if (playerType && !isPlayerFinished(playerIndex)) {
                numberOfRemainingPlayers++;
            }
        })

        if (numberOfRemainingPlayers === 1) {
            playerTypes.forEach((playerType, playerIndex) => {
                if (playerType && playerRanks[playerIndex] === 0) {
                    playerRanks[playerIndex] = ++lastRank
                    playerTimes[playerIndex] = new Date().getTime() - gameStartedAt
                }
            })

            document.getElementById("game-container").appendChild(document.createElement("wc-game-end"))
            document.getElementById("game").classList.add("hidden")
            isGameDone = true;
        }
    }

    if (!isGameDone) {
        saveGameState();
        activateDice();

        const diceElement = document.getElementById("wc-dice");
        if (!tripComplete && captureCount === 0 && currentDiceRoll !== 6) {
            updateCurrentPlayer();
        } else {
            if (isAutoplay()) {
                setTimeout(() => diceElement.click(), 600)
            }
        }
    } else {
        clearSavedGame();
    }
}


function handleDiceMoved() {
    if (isAutoplay()) {
        setTimeout(() => handleDiceRoll(), 600)
    }
}


/**
 * @param {'autoRollDice'|'autoMoveSingleOption'|'autoMoveOutOfHome'} flag
 * @param {boolean} value
 */
export function setAssistFlag(flag, value) {
    if (flag in assistFlags) assistFlags[flag] = value
}

let _quickStartId = null;

function saveGameState() {
    if (!_quickStartId) return;
    const state = {
        quickStartId: _quickStartId,
        playerNamesArr: Array.from(playerNames),
        playerTypesArr: Array.from(playerTypes),
        positions: playerTokenPositions.map(p => p ? Array.from(p) : null),
        currentPlayerIndex,
        currentDiceRoll,
        consecutiveSixesCount,
        capturesArr: Array.from(playerCaptures),
        ranksArr: Array.from(playerRanks),
        timesArr: Array.from(playerTimes),
        lastRank,
        gameStartedAt,
    };
    localStorage.setItem('ludo-save', JSON.stringify(state));
}

export function clearSavedGame() {
    localStorage.removeItem('ludo-save');
}

export function getSavedGame() {
    try {
        const raw = localStorage.getItem('ludo-save');
        return raw ? JSON.parse(raw) : null;
    } catch { return null; }
}

export function handleGameResume() {
    const saved = getSavedGame();
    if (!saved) return;

    _quickStartId = saved.quickStartId;
    gameStartedAt = saved.gameStartedAt;
    lastRank = saved.lastRank;
    consecutiveSixesCount = saved.consecutiveSixesCount;
    currentDiceRoll = saved.currentDiceRoll;
    resetTurnCount();
    initRailDeps(playerTypes, getCurrentPlayerIndex, getFinishedCount, getIsLocalMultiplayer);

    initPlayers(saved.quickStartId);

    saved.playerTypesArr.forEach((t, i) => playerTypes[i] = t);
    (saved.playerNamesArr || []).forEach((n, i) => playerNames[i] = n || '');
    setPlayerNames(playerNames);
    saved.capturesArr.forEach((c, i) => playerCaptures[i] = c);
    saved.ranksArr.forEach((r, i) => playerRanks[i] = r);
    saved.timesArr.forEach((t, i) => playerTimes[i] = t);

    currentPlayerIndex = saved.currentPlayerIndex;

    showGame();

    playerTypes.forEach((playerType, playerIndex) => {
        if (playerType && saved.positions[playerIndex]) {
            saved.positions[playerIndex].forEach((pos, tokenIndex) => {
                playerTokenPositions[playerIndex][tokenIndex] = pos;
                const token = document.createElement("wc-token");
                token.setAttribute("id", getTokenElementId(playerIndex, tokenIndex));
                const containerId = getTokenContainerId(playerIndex, tokenIndex, pos);
                const container = document.getElementById(containerId);
                if (container) container.appendChild(token);
            });
        }
    });

    moveDice(currentPlayerIndex);
    handleDiceMoved();
}