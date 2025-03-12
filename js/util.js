"use strict"

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min)) // max not inclusive
}

function makeId(length = 6) {
  var txt = ""
  var possible =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"

  for (var i = 0; i < length; i++) {
    txt += possible.charAt(Math.floor(Math.random() * possible.length))
  }
  return txt
}

function getRandomColor() {
  var letters = "0123456789ABCDEF"
  var color = "#"
  for (var i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)]
  }
  return color
}

function getRandomColor() {
  const letters = "0123456789ABCDEF"
  var color = "#"
}

function getEmptyCell() {
    var emptyCells = []

    for (var i = 0; i < gBoard.length; i++) {
        for (var j = 0; j < gBoard[0].length; j++) {
            if (!gBoard[i][j].isMine && gBoard[i][j].isCovered) {
                emptyCells.push({ i, j })
            }
        }
    }

    if (emptyCells.length === 0) return null
    var randIdx = Math.floor(Math.random() * emptyCells.length);
    return emptyCells[randIdx]
}

  

// function playEatingSound() {
//   new Audio("sounds/collectFood.mp3").play()
// }

function createMat(rows, cols) {
  var mat = []
  for (var i = 0; i < rows; i++) {
    var row = []
    for (var j = 0; j < cols; j++) {
      row.push("")
    }
    mat.push(row)
  }
  return mat
}

function renderCell(location, value) {
  // Select the elCell and set the value
  const elCell = document.querySelector(`.cell-${location.i}-${location.j}`)
  elCell.innerHTML = value
}