import './style.css'

function setupGrid() {
    const grid = document.createElement("div")
    grid.className = "size-[40rem] grid grid-cols-15"
    document.querySelector("#root").appendChild(grid)

    for (let r = 0; r < 15; r++) {
        for (let c = 0; c < 15; c++) {
            const cell = document.createElement("div")
            cell.id = `cell-${r}-${c}`
            cell.className = "flex items-center justify-center bg-sky-100 border border-gray-500"
            grid.appendChild(cell)
        }
    }
}

setupGrid()