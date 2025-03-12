'use strict'

var gBoard
var gFirstClick = true

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
    gFirstClick = true
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

            const cellContent = cell.isCovered ? "" : (cell.isMine ? "💣" : cell.minesAroundCount)

            strHTML += `<td class="${className} ${cell.isCovered ? '' : 'revealed'}" 
                        onclick="onCellClicked(this, ${i}, ${j})">${cellContent}</td>`
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
    if (!gGame.isOn) return;

    const cell = gBoard[i][j];

    if (gFirstClick) {
        gFirstClick = false;
        addRandomBomb(i, j);
    }

    if (cell.isMine) {
        showMessage("💥 הפסדת!", "red");
        gGame.isOn = false;
        for (var i = 0; i < gBoard.length; i++) {
            for (var j = 0; j < gBoard[0].length; j++) {
                gBoard[i][j].isCovered = false;
            }
        }
        renderBoard(gBoard);
    } else {
        cell.isCovered = false;

        if (cell.minesAroundCount === 0) {
            expandReveal(gBoard, elCell, i, j);
        }

        renderBoard(gBoard);
        checkVictory();
    }
}



function expandReveal(board, elCell, i, j) {
    for (var row = i - 1; row <= i + 1; row++) {
        for (var col = j - 1; col <= j + 1; col++) {
            if (row < 0 || row >= board.length) continue
            if (col < 0 || col >= board[0].length) continue
            if (row === i && col === j) continue

            var neighborCell = board[row][col]

            if (!neighborCell.isMine && neighborCell.isCovered) {
                neighborCell.isCovered = false

                if (neighborCell.minesAroundCount === 0) {
                    expandReveal(board, elCell, row, col)
                }
            }
        }
    }
    renderBoard(board)
}


function addRandomBomb(firstI, firstJ) {
    for (var i = 0; i < gLevel.MINES; i++) {
        var emptyCell = getEmptyCell()

        if (!emptyCell) {
            console.warn("No empty cells available for bombs!")
            return
        }

        while (emptyCell.i === firstI && emptyCell.j === firstJ) {
            emptyCell = getEmptyCell()
            if (!emptyCell) return
        }

        gBoard[emptyCell.i][emptyCell.j].isMine = true
    }

    for (var i = 0; i < gBoard.length; i++) {
        for (var j = 0; j < gBoard[0].length; j++) {
            if (!gBoard[i][j].isMine) {
                gBoard[i][j].minesAroundCount = setMinesNegsCount(gBoard, i, j)
            }
        }
    }

    renderBoard(gBoard)
}

function onRestart() {
    onInit()
    document.querySelector(".message").style.display = "none"
}


function checkVictory() {
    for (var i = 0; i < gBoard.length; i++) {
        for (var j = 0; j < gBoard[0].length; j++) {
            const cell = gBoard[i][j]

            if (!cell.isMine && cell.isCovered) return false
        }
    }

    showMessage("🎉 ניצחת!", "green")
    gGame.isOn = false
    return true
}


function showMessage(message, color) {
    const elMessage = document.querySelector(".message")
    elMessage.style.display = "block"
    elMessage.innerText = message
    elMessage.style.backgroundColor = color
}
