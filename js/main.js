'use strict'

var gBoard

var gLevel = {
    SIZE: 4,
    MINES: 2
}

var gGame = { 
    isOn: false, 
    revealedCount: 0, 
    markedCount: 0, 
    secsPassed: 0 
} 


function onInit() {
    gBoard = buildBoard()
    renderBoard(gBoard)
    gGame.isOn = true
}


function buildBoard() {
    const board = []

    for (var i = 0; i < gLevel.SIZE; i++) {
        board.push([])
        for (var j = 0; j < gLevel.SIZE; j++) {
            board[i][j] = {
                minesAroundCount: 0,
                isCovered: true,
                isMine: false,
                isMarked: false
            }
        }
    }

    // board[0][0].isMine = true
    // board[3][3].isMine = true

    for (var i = 0; i < board.length; i++) {
        for (var j = 0; j < board[0].length; j++) {
            if (!board[i][j].isMine) {
                board[i][j].minesAroundCount = setMinesNegsCount(board, i, j)
            }
        }
    }
    console.table(board)
    return board
}

function renderBoard(board) {
    var strHTML = ""

    for (var i = 0; i < board.length; i++) {
        strHTML += "<tr>"
        for (var j = 0; j < board[0].length; j++) {
            const cell = board[i][j]
            const className = getClassName({ i: i, j: j })
            const cellContent = cell.isMine ? "💣" : cell.minesAroundCount

            strHTML += `<td class="${className}" onclick="onCellClicked(this, ${i}, ${j})">${cellContent}</td>`
        }
        strHTML += "</tr>"
    }
    const elBoard = document.querySelector(".board")
    elBoard.innerHTML = strHTML
}


function getClassName(location) {
    const cellClass = `cell-${location.i}-${location.j}` // 'cell-2-5'
    return cellClass
}

function setMinesNegsCount(board, rowIdx, colIdx) {
    var count = 0

    for (var i = rowIdx - 1; i <= rowIdx + 1; i++) {
        if (i < 0 || i >= board.length) continue
        for (var j = colIdx - 1; j <= colIdx + 1; j++) {
            if (i === rowIdx && j === colIdx) continue
            if (j < 0 || j >= board[0].length) continue
            var currCell = board[i][j]
            if (currCell.isMine) count++
        }
    }
    return count
}

function onCellClicked(elCell, i, j) {
    const cell = gBoard[i][j]

    if(!gGame.isOn) return

    // if the cell is bomb
    if (cell.isMine){
        console.log('Game over!')
        gGame.isOn = false

        for( var i = 0; i < gBoard.length; i++){
            for( var j = 0; j < gBoard[0].length; j++){
                    gBoard[i][j].isCovered = false
            }
        }
        renderBoard(gBoard)
        console.table(gBoard)
        // all cells are need to uncover
    } else {
        // cell need to uncover and if there is no bomb negs (0 mine count) so negb cell are need to uncover too
        

        if(cell.minesAroundCount > 0){
            cell.isCovered = false
        }
        if(cell.minesAroundCount === 0){
            expandReveal(gBoard, cell, i, j)
            cell.isCovered = false
        }

        renderBoard(gBoard)
        console.table(gBoard)
    }

    console.log('Cell clicked: ', elCell, i, j)
}

function expandReveal(board, elCell, i, j) {
    for (var row = i - 1; row <= i + 1; row++) {
        for (var col = j - 1; col <= j + 1; col++) {
            if (row < 0 || row >= board.length) continue
            if (col < 0 || col >= board[0].length) continue

            if (row === i && col === j) continue

            var neighborCell = board[row][col]
            if(!neighborCell.isMine && neighborCell.isCovered){
                neighborCell.isCovered = false
                
                var elNeighborCell = document.querySelector(`.cell-${row}-${col}`)
                elNeighborCell.classList.add('revealed')
            }

        }
    }
    renderBoard(board)
}
addRandomBomb()
function addRandomBomb() {
    var emptyCell = getEmptyCell()
    gBoard[emptyCell.i][emptyCell.j].isMine = true
    renderCell(emptyCell, gBoard[emptyCell.i][emptyCell.j])
}