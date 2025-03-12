'use strict'

var gBoard
var gFirstClick = true
var gLives = 3


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
    gLives = 3

    var elLives = document.querySelector('.game-lives')
    elLives.innerText = '❤️Lives: ' + gLives

    document.addEventListener("contextmenu", (event) => event.preventDefault());
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
                isMarked: false,
                isHit : false
            }
        }
    }
    for (var i = 0; i < board.length; i++) {
        for (var j = 0; j < board[0].length; j++) {
            if (!board[i][j].isMine) {
                board[i][j].minesAroundCount = setMinesNegsCount(board, i, j)
            }
        }
    }
    return board
}

function renderBoard(board) {
    var strHTML = "";

    for (var i = 0; i < board.length; i++) {
        strHTML += "<tr>";
        for (var j = 0; j < board[0].length; j++) {
            const cell = board[i][j];
            const className = getClassName({ i: i, j: j });
            const classList = `${className} ${cell.isCovered ? '' : 'revealed'} ${cell.isHit ? 'bomb-hit' : ''}`;

            // ✅ אם התא פתוח והוא לא מוקש, נוודא ש-0 יוצג כריק ""
            let cellContent = "";
            if (!cell.isCovered) {
                if (cell.isMine) {
                    cellContent = "💣";
                } else if (cell.minesAroundCount > 0) {
                    cellContent = cell.minesAroundCount; // הצגת מספר רגיל
                } else {
                    cellContent = ""; // במקרה של 0, משאירים ריק
                }
            }

            strHTML += `<td class="${classList}" onclick="onCellClicked(this, ${i}, ${j})" 
                        oncontextmenu="onCellRightClick(event, ${i}, ${j})"
                        data-marked="${cell.isCovered && cell.isMarked ? '🚩' : ''}">
                ${cellContent}</td>`;
        }
        strHTML += "</tr>";
    }
    const elBoard = document.querySelector(".board");
    elBoard.innerHTML = strHTML;
}


function getClassName(location) {
    const cellClass = `cell-${location.i}-${location.j}`
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
    if (!gGame.isOn) return

    const cell = gBoard[i][j]

    if (gFirstClick) {
        gFirstClick = false
        addRandomBomb(i, j)
    }

    if (cell.isMine) {
        gLives--
        var elLives = document.querySelector('.game-lives')
        elLives.innerText = '❤️Lives: ' + gLives

        cell.isHit = true        

        if(gLives === 0){
            showMessage("💥הפסדת", "red")
            updateSmiley('lose')
            gGame.isOn = false
        
        for (var i = 0; i < gBoard.length; i++) {
            for (var j = 0; j < gBoard[0].length; j++) {
                gBoard[i][j].isCovered = false
            }
        }
    }
        renderBoard(gBoard)
    } else {
        cell.isCovered = false

        if (cell.minesAroundCount === 0) {
            expandReveal(gBoard, elCell, i, j)
        }
        renderBoard(gBoard)
        checkVictory()
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

function checkVictory() {
    var minesCorrectlyMarked = 0
    var totalMines = gLevel.MINES
    var revealedCount = 0
    var totalCells = gLevel.SIZE * gLevel.SIZE
    var incorrectFlags = 0

    for (var i = 0; i < gBoard.length; i++) {
        for (var j = 0; j < gBoard[0].length; j++) {
            const cell = gBoard[i][j]

            if (!cell.isCovered) revealedCount++
            if (cell.isMarked && !cell.isMine) incorrectFlags++
            if (cell.isMine && cell.isMarked) minesCorrectlyMarked++
        }
    }
    if ((minesCorrectlyMarked === totalMines && incorrectFlags === 0) ||
        (revealedCount === totalCells - totalMines)) {
        showMessage("🎉ניצחת", "green")
        gGame.isOn = false
        updateSmiley('win')
        return true
    }
    return false
}

function showMessage(message, color) {
    const elMessage = document.querySelector(".message")
    elMessage.style.display = "block"
    elMessage.innerText = message
    elMessage.style.backgroundColor = color
}

function onCellRightClick(event, i, j) {
    event.preventDefault()
    const cell = gBoard[i][j]

    if (!cell.isCovered) return

    cell.isMarked = !cell.isMarked

    gGame.markedCount = gBoard.flat().filter(c => c.isMarked).length

    renderBoard(gBoard)
    setTimeout(checkVictory, 50)
}

function updateSmiley(status) {
    const elSmiley = document.querySelector('.smiley-btn')

    if (status === 'win'){
        elSmiley.innerText = '😎'
    } else if (status === 'lose'){
        elSmiley.innerText = '🤯'
    } else {
        elSmiley.innerHTML = '😀'
    }

}

function onRestart() {
    onInit()
    document.querySelector(".message").style.display = "none"
    updateSmiley('normal')
}