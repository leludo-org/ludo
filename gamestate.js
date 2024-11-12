/**
 * @typedef {'PLAYER'|'BOT'} PlayerType
 */
import {moveDice} from "./main.js";

class PlayerState {

    /**
     *
     * @type {PlayerType}
     */
    playerType;


    /**
     *
     * @type {number[]}
     */
    tokenPositions = new Array(4).fill(-1)


    /**
     * @returns {boolean}
     */
    isBot() {
        return this.playerType === "BOT"
    }


    /**
     *
     * @param {PlayerType} playerType
     */
    constructor(playerType) {
        this.playerType = playerType
    }
}


export class GameState {

    /**
     *
     * @type {number}
     */
    currentPlayerIndex = 2;

    /**
     *
     * @type {number}
     */
    currentDiceRoll = 1;

    /**
     * @type {number}
     */
    consecutiveSixesCount = 0

    /**
     *
     * @type {boolean}
     */
    autoplay = false

    /**
     *
     * @type {PlayerState[]}
     */
    playerStates = new Array(4)


    /**
     *
     * @param {string} quickStartId
     */
    initPlayers(quickStartId) {
        getPlayerTypes(quickStartId).forEach((type, index) => {
            if (type) {
                this.playerStates[index] = new PlayerState(type)
            }
        })
    }

    /**
     *
     * @returns {boolean}
     */
    isCurrentPlayerBot() {
        return this.playerStates[this.currentPlayerIndex].isBot()
    }

    /**
     *
     * @returns {boolean}
     */
    isAutoplay() {
        return this.autoplay || this.isCurrentPlayerBot()
    }


    updateCurrentPlayer() {
        this.consecutiveSixesCount = 0

        do {
            this.currentPlayerIndex = (this.currentPlayerIndex + 1) % 4
        } while (this.playerStates[this.currentPlayerIndex] === undefined)

        moveDice()
    }
}


/**
 *
 * @param {string} quickStartId
 * @return {PlayerType[]}
 */
function getPlayerTypes(quickStartId) {
    switch (quickStartId) {
        case "qs,1,1":
            return ["BOT", undefined, "PLAYER", undefined]
        case "qs,1,2":
            return [undefined, "BOT", "PLAYER", "BOT"]
        case "qs,1,3":
            return ["BOT", "BOT", "PLAYER", "BOT"]
        case "qs,2,0":
            return ["PLAYER", undefined, "PLAYER", undefined]
        case "qs,2,1":
            return ["PLAYER", undefined, "PLAYER", "BOT"]
        case "qs,2,2":
            return ["PLAYER", "BOT", "PLAYER", "BOT"]
        case "qs,3,0":
            return ["PLAYER", undefined, "PLAYER", "PLAYER"]
        case "qs,3,1":
            return ["PLAYER", "BOT", "PLAYER", "PLAYER"]
        case "qs,4,0":
            return ["PLAYER", "PLAYER", "PLAYER", "PLAYER"]
    }
}