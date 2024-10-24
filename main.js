import './style.css'

function setupGrid() {
    const grid = document.createElement("div")
    grid.className = "size-[40rem] flex flex-col justify-evenly"
    document.querySelector("#root").appendChild(grid)


    for (let r = 0; r < 15; r++) {
        const row = document.createElement("div")
        row.id = `row-1${r}`
        row.className = "flex justify-evenly"
        grid.appendChild(row)

        for (let c = 0; c < 15; c++) {
            const cell = document.createElement("div")
            cell.id = `column-1${r}`
            cell.innerHTML = `${r}-${c}`
            row.appendChild(cell)
        }
    }
}

setupGrid()