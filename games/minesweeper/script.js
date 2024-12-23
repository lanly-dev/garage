const boardSizes = {
  small: { size: 8, mines: 10 },
  medium: { size: 16, mines: 40 },
  large: { size: 22, mines: 99 }
}
const gameBoard = document.getElementById(`game-board`)
const mineCountLabel = document.getElementById(`mine-count`)
const resetBtn = document.getElementById(`reset`)
resetBtn.addEventListener(`click`, resetGame)

let board = []
let boardSize = boardSizes.small.size
let mineCount = boardSizes.small.mines

let elapsedTime = 0
let firstClick = true
let gameStarted = false
let mines = 0
let timerInterval

function applySettings(boardSize) {
  window.boardSize = boardSize.size
  mineCount = boardSize.mines
  resetGame()
}

function cellClickHandler(event) {
  const row = event.target.dataset.row
  const col = event.target.dataset.col
  if (firstClick) {
    ensureSafeFirstClick(event.target)
    firstClick = false
    gameStarted = true
    smileyAnimation()
    startTimer()
  }
  if (event.target.classList.contains(`revealed`) && event.target.textContent) {
    revealAdjacentCells(parseInt(row), parseInt(col))
  } else revealCell(parseInt(row), parseInt(col))
}

function smileyAnimation() {
  resetBtn.textContent = `😮`
  setTimeout(() => resetBtn.textContent = `😊`, 200)
}

function countMines(row, col) {
  let count = 0
  for (let r = -1; r <= 1; r++) {
    for (let c = -1; c <= 1; c++) {
      if (r === 0 && c === 0) continue
      const newRow = row + r
      const newCol = col + c
      // Check if the new position is within the board boundaries
      if (newRow < 0 || newRow >= boardSize || newCol < 0 || newCol >= boardSize) continue
      // Increment count if a mine is found at the new position
      if (board[newRow][newCol].mine) count++
    }
  }
  return count
}

function disableBoard(bool) {
  gameBoard.classList.toggle(`disabled`, bool)
}

function initBoard() {
  disableBoard(false)
  gameBoard.style.gridTemplateColumns = `repeat(${boardSize}, 30px)`
  gameBoard.style.gridTemplateRows = `repeat(${boardSize}, 30px)`
  for (let row = 0; row < boardSize; row++) {
    board[row] = []
    for (let col = 0; col < boardSize; col++) {
      const cell = document.createElement(`div`)
      cell.classList.add(`cell`)
      cell.dataset.row = row
      cell.dataset.col = col
      cell.addEventListener(`click`, cellClickHandler)
      cell.addEventListener(`contextmenu`, putFlagHandler)
      gameBoard.appendChild(cell)
      board[row][col] = {
        element: cell,
        mine: false,
        revealed: false,
        flag: false
      }
    }
  }
  placeMines()
}

function placeMines() {
  while (mines < mineCount) {
    const row = Math.floor(Math.random() * boardSize)
    const col = Math.floor(Math.random() * boardSize)
    if (!board[row][col].mine) {
      board[row][col].mine = true
      mines++
    }
  }
}

function putFlagHandler(event) {
  event.preventDefault()
  if (firstClick) return // Prevent flagging before the first click

  const cell = event.target
  const row = cell.dataset.row
  const col = cell.dataset.col
  const cellData = board[row][col]

  if (cellData.revealed) return

  cellData.flag = !cellData.flag
  cell.textContent = cellData.flag ? `⚑` : ``
  cell.classList.toggle(`flag`, cellData.flag)

  const flaggedCells = document.querySelectorAll(`.flag`).length
  mineCountLabel.textContent = `💣${mineCount - flaggedCells}`
}

function resetGame() {
  const cells = document.querySelectorAll(`.cell`)
  cells.forEach(cell => {
    cell.classList.remove(`revealed`, `mine`, `flag`)
    cell.style.backgroundColor = `#ccc`
    cell.textContent = `` // Reset cell content
  })

  board = []
  mines = 0
  gameBoard.innerHTML = ``
  stopTimer()
  resetTimer()
  gameStarted = false
  firstClick = true
  mineCountLabel.textContent = `💣${mineCount}` // Reset mine count label
  resetBtn.textContent = `😊`
  initBoard()
}

function resetTimer() {
  elapsedTime = 0
  updateTimerDisplay()
}

function revealCell(row, col) {
  if (row < 0 || col < 0 || row >= boardSize || col >= boardSize) return
  const cell = board[row][col]
  if (cell.revealed || cell.flag) return

  cell.revealed = true
  cell.element.classList.add(`revealed`)

  if (cell.mine) {
    // Game over
    cell.element.classList.add(`mine`)
    cell.element.textContent = `💣`
    disableBoard(true)
    stopTimer()
    resetBtn.textContent = `😆`
    return
  }

  const mineCount = countMines(row, col)
  if (mineCount > 0) {
    cell.element.textContent = mineCount
  } else {
    // Reveal adjacent cells
    for (let r = -1; r <= 1; r++) {
      for (let c = -1; c <= 1; c++) {
        if (r !== 0 || c !== 0) revealCell(row + r, col + c)
      }
    }
  }

  // Check for win condition
  if (checkWin()) {
    disableBoard(true)
    stopTimer()
    resetBtn.textContent = `😎`
    // revealLastMine()
    return
  }
  smileyAnimation()
}

function checkWin() {
  for (let row = 0; row < boardSize; row++) {
    for (let col = 0; col < boardSize; col++) {
      const cell = board[row][col]
      if (!cell.mine && !cell.revealed) return false
    }
  }
  return true
}

function setupSettings() {
  document.getElementById(`settings`).addEventListener(`click`, function () {
    document.getElementById(`settings-menu`).style.display = `block`
  })

  document.getElementById(`close-settings`).addEventListener(`click`, function () {
    document.getElementById(`settings-menu`).style.display = `none`
  })

  document.getElementById(`apply-settings`).addEventListener(`click`, function () {
    const selectedSize = document.querySelector(`input[name="board-size"]:checked`).value
    const selectedBoardSize = boardSizes[selectedSize]

    boardSize = selectedBoardSize.size
    mineCount = selectedBoardSize.mines

    mineCountLabel.textContent = `💣${mineCount}`
    applySettings(selectedBoardSize)
    document.getElementById(`settings-menu`).style.display = `none`
  })
}

function startTimer() {
  elapsedTime = 0
  timerInterval = setInterval(() => {
    elapsedTime++
    updateTimerDisplay()
  }, 1000)
}

function stopTimer() {
  clearInterval(timerInterval)
}

function updateTimerDisplay() {
  const timerElement = document.getElementById(`timer`)
  timerElement.textContent = `⏳${elapsedTime}`
}

function ensureSafeFirstClick(cell) {
  const row = cell.dataset.row
  const col = cell.dataset.col
  if (board[row][col].mine) {
    board[row][col].mine = false
    placeNewMine()
  }
  expandSafeArea(row, col)
}

function placeNewMine() {
  let placed = false
  while (!placed) {
    const row = Math.floor(Math.random() * boardSize)
    const col = Math.floor(Math.random() * boardSize)
    if (!board[row][col].mine) {
      board[row][col].mine = true
      placed = true
    }
  }
}


function expandSafeArea(row, col) {
  const queue = [[parseInt(row), parseInt(col)]]
  const directions = [
    [-1, -1], [-1, 0], [-1, 1],
    [0, -1], [0, 1],
    [1, -1], [1, 0], [1, 1]
  ]

  let expanded = false

  while (queue.length > 0) {
    const [currentRow, currentCol] = queue.shift()
    const cell = board[currentRow][currentCol]

    if (cell.revealed || cell.mine) continue
    cell.revealed = true
    cell.element.classList.add(`revealed`)

    const mineCount = countMines(currentRow, currentCol)
    if (mineCount > 0) cell.element.textContent = mineCount
    else {
      expanded = true
      for (const [dRow, dCol] of directions) {
        const newRow = currentRow + dRow
        const newCol = currentCol + dCol
        if (newRow >= 0 && newRow < boardSize && newCol >= 0 && newCol < boardSize) queue.push([newRow, newCol])
      }
    }
  }

  if (!expanded && firstClick) {
    // If no expansion happened on the first click, reset the board and try again
    resetGame()
    ensureSafeFirstClick(board[row][col].element)
  }
}

function revealAdjacentCells(row, col) {
  const mineCount = countMines(row, col)
  let flagCount = 0

  for (let r = -1; r <= 1; r++) {
    for (let c = -1; c <= 1; c++) {
      if (r === 0 && c === 0) continue
      const newRow = row + r
      const newCol = col + c
      if (newRow < 0 || newRow >= boardSize || newCol < 0 || newCol >= boardSize) continue
      if (board[newRow][newCol].flag) flagCount++
    }
  }

  if (flagCount === mineCount) {
    for (let r = -1; r <= 1; r++) {
      for (let c = -1; c <= 1; c++) {
        if (r === 0 && c === 0) continue
        const newRow = row + r
        const newCol = col + c
        if (newRow < 0 || newRow >= boardSize || newCol < 0 || newCol >= boardSize) continue
        revealCell(newRow, newCol)
      }
    }
  }
}

setupSettings()
initBoard()
