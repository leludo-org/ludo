import './style.css'

const PLAYER_1_COLOR = "bg-red-600"
const PLAYER_2_COLOR = "bg-green-600"
const PLAYER_3_COLOR = "bg-yellow-600"
const PLAYER_4_COLOR = "bg-blue-600"

// todo: need to numerical color instead of this ugly array, just used to visualize for now
const GRID_CELL_STYLES = [
    [PLAYER_1_COLOR, PLAYER_1_COLOR, PLAYER_1_COLOR, PLAYER_1_COLOR, PLAYER_1_COLOR, PLAYER_1_COLOR, "", "", "", PLAYER_2_COLOR, PLAYER_2_COLOR, PLAYER_2_COLOR, PLAYER_2_COLOR, PLAYER_2_COLOR, PLAYER_2_COLOR],
    [PLAYER_1_COLOR, "", "", "", "", PLAYER_1_COLOR, "", "", "", PLAYER_2_COLOR, "", "", "", "", PLAYER_2_COLOR],
    [PLAYER_1_COLOR, "", "", "", "", PLAYER_1_COLOR, "", "", "", PLAYER_2_COLOR, "", "", "", "", PLAYER_2_COLOR],
    [PLAYER_1_COLOR, "", "", "", "", PLAYER_1_COLOR, "", "", "", PLAYER_2_COLOR, "", "", "", "", PLAYER_2_COLOR],
    [PLAYER_1_COLOR, "", "", "", "", PLAYER_1_COLOR, "", "", "", PLAYER_2_COLOR, "", "", "", "", PLAYER_2_COLOR],
    [PLAYER_1_COLOR, PLAYER_1_COLOR, PLAYER_1_COLOR, PLAYER_1_COLOR, PLAYER_1_COLOR, PLAYER_1_COLOR, "", "", "", PLAYER_2_COLOR, PLAYER_2_COLOR, PLAYER_2_COLOR, PLAYER_2_COLOR, PLAYER_2_COLOR, PLAYER_2_COLOR],
    ["", "", "", "", "", "", "", "", "", "", "", "", "", "", ""],
    ["", "", "", "", "", "", "", "", "", "", "", "", "", "", ""],
    ["", "", "", "", "", "", "", "", "", "", "", "", "", "", ""],
    [PLAYER_4_COLOR, PLAYER_4_COLOR, PLAYER_4_COLOR, PLAYER_4_COLOR, PLAYER_4_COLOR, PLAYER_4_COLOR, "", "", "", PLAYER_3_COLOR, PLAYER_3_COLOR, PLAYER_3_COLOR, PLAYER_3_COLOR, PLAYER_3_COLOR, PLAYER_3_COLOR],
    [PLAYER_4_COLOR, "", "", "", "", PLAYER_4_COLOR, "", "", "", PLAYER_3_COLOR, "", "", "", "", PLAYER_3_COLOR],
    [PLAYER_4_COLOR, "", "", "", "", PLAYER_4_COLOR, "", "", "", PLAYER_3_COLOR, "", "", "", "", PLAYER_3_COLOR],
    [PLAYER_4_COLOR, "", "", "", "", PLAYER_4_COLOR, "", "", "", PLAYER_3_COLOR, "", "", "", "", PLAYER_3_COLOR],
    [PLAYER_4_COLOR, "", "", "", "", PLAYER_4_COLOR, "", "", "", PLAYER_3_COLOR, "", "", "", "", PLAYER_3_COLOR],
    [PLAYER_4_COLOR, PLAYER_4_COLOR, PLAYER_4_COLOR, PLAYER_4_COLOR, PLAYER_4_COLOR, PLAYER_4_COLOR, "", "", "", PLAYER_3_COLOR, PLAYER_3_COLOR, PLAYER_3_COLOR, PLAYER_3_COLOR, PLAYER_3_COLOR, PLAYER_3_COLOR],
]

function setupGrid() {
    const grid = document.createElement("div")
    grid.className = "size-[40rem] grid grid-cols-15"
    document.querySelector("#root").appendChild(grid)

    for (let r = 0; r < 15; r++) {
        for (let c = 0; c < 15; c++) {
            const cell = document.createElement("div")
            cell.id = `cell-${r}-${c}`
            cell.className = "flex items-center justify-center bg-sky-100 border border-black " + GRID_CELL_STYLES[r][c]
            grid.appendChild(cell)
        }
    }
}

// setupGrid()