const boardSize = 10
const mineCount = 10
let board = []
let mines = 0
let timerInterval
let elapsedTime = 0
let gameStarted = false

const gameBoard = document.getElementById(`game-board`)
gameBoard.style.gridTemplateColumns = `repeat(${boardSize}, 30px)`
gameBoard.style.gridTemplateRows = `repeat(${boardSize}, 30px)`
document.getElementById(`reset`).addEventListener(`click`, resetGame)

function setupSettings() {
  document.getElementById(`settings`).addEventListener(`click`, function () {
    document.getElementById(`settings-menu`).style.display = `block`
  })

  document.getElementById(`close-settings`).addEventListener(`click`, function () {
    document.getElementById(`settings-menu`).style.display = `none`
  })

  document.getElementById(`apply-settings`).addEventListener(`click`, function () {
    const boardSize = parseInt(document.getElementById(`board-size`).value)
    applySettings(boardSize)
    document.getElementById(`settings-menu`).style.display = `none`
  })
}

setupSettings()

function applySettings(boardSize) {
  window.boardSize = boardSize
  resetGame()
}

function initBoard() {
  disableBoard(false)
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

function cellClickHandler(event) {
  if (!gameStarted) {
    startTimer()
    gameStarted = true
  }
  const row = event.target.dataset.row
  const col = event.target.dataset.col
  revealCell(parseInt(row), parseInt(col))
}

function putFlagHandler(event) {
  event.preventDefault()
  const cell = event.target
  const row = cell.dataset.row
  const col = cell.dataset.col
  const cellData = board[row][col]

  if (cellData.revealed) return

  cellData.flag = !cellData.flag
  cell.textContent = cellData.flag ? `⚑` : ``
  cell.classList.toggle(`flag`, cellData.flag)
}

function revealCell(row, col) {
  if (row < 0 || col < 0 || row >= boardSize || col >= boardSize) return
  const cell = board[row][col]
  if (cell.revealed || cell.flag) return

  cell.revealed = true
  cell.element.classList.add(`revealed`)

  if (cell.mine) {
    cell.element.classList.add(`mine`)
    cell.element.textContent = `💣`
    disableBoard(true)
    stopTimer()
    return
  }

  const mineCount = countMines(row, col)
  if (mineCount > 0) cell.element.textContent = mineCount
  else {
    for (let r = -1; r <= 1; r++) {
      for (let c = -1; c <= 1; c++)
        if (r !== 0 || c !== 0) revealCell(row + r, col + c)
    }
  }
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

function resetGame() {
  const cells = document.querySelectorAll(`.cell`)
  cells.forEach(cell => {
    cell.classList.remove(`revealed`, `mine`, `flag`)
    cell.style.backgroundColor = `#ccc`
  })

  board = []
  mines = 0
  gameBoard.innerHTML = ``
  stopTimer()
  resetTimer()
  gameStarted = false
  initBoard()
}

function disableBoard(bool) {
  gameBoard.classList.toggle(`disabled`, bool)
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

function resetTimer() {
  elapsedTime = 0
  updateTimerDisplay()
}

function updateTimerDisplay() {
  const timerElement = document.getElementById(`timer`)
  timerElement.textContent = `⏳ ${elapsedTime}`
}

initBoard()
