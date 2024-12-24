const boardSizes = {
  small: { size: 8, mines: 10 },
  medium: { size: 16, mines: 40 },
  large: { size: 22, mines: 99 }
}
const gameBoard = document.getElementById(`game-board`)
const mineCountLabel = document.getElementById(`mine-count`)
const resetBtn = document.getElementById(`reset`)
const settingsMenu = document.getElementById(`settings-menu`)
resetBtn.addEventListener(`click`, resetGame)

const applySettingsBtn = document.getElementById(`apply-settings`)
const closeSettingsBtn = document.getElementById(`close-settings`)
const settingsForm = document.querySelector(`#settings-menu form`)
let currentSettings = {
  boardSize: `small`,
  isDeciseconds: false
}

let board = []
let boardSize = boardSizes.small.size
let mineCount = boardSizes.small.mines

let elapsedTime = 0
let firstClick = true
let gameStarted = false
let mines = 0
let timerInterval
let timerUnit = `seconds`

function applySettings(selectedSize, isDeciseconds) {
  const { mines } = boardSizes[selectedSize]
  mineCountLabel.textContent = `💣${mines}`
  timerUnit = isDeciseconds ? `deciseconds` : `seconds`
  currentSettings = { boardSize: selectedSize, isDeciseconds }
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
  cell.textContent = cellData.flag ? `🚩` : ``
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

  const mineCount = countMines(row, col)
  if (cell.mine) {
    // Game over
    cell.element.classList.add(`mine`)
    cell.element.textContent = `💣`
    disableBoard(true)
    stopTimer()
    revealIncorrectFlags()
    resetBtn.textContent = `😆`
    return
  } else if (mineCount > 0) {
    cell.element.textContent = mineCount
    cell.element.classList.add(`no-select`) // Add this line
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
    return
  }
  smileyAnimation()
}

function revealHiddenMines() {
  for (let row = 0; row < boardSize; row++) {
    for (let col = 0; col < boardSize; col++) {
      const cell = board[row][col]
      if (cell.mine && !cell.revealed && !cell.flag) {
        cell.revealed = true
        cell.element.classList.add(`revealed`)
        cell.element.classList.add(`last-mine`)
        cell.element.textContent = `💣`
        cell.element.style.backgroundColor = `lightgreen`
      }
    }
  }
}

function checkWin() {
  for (let row = 0; row < boardSize; row++) {
    for (let col = 0; col < boardSize; col++) {
      const cell = board[row][col]
      if (!cell.mine && !cell.revealed) return false
    }
  }
  revealHiddenMines()
  return true
}

function setupSettings() {
  document.getElementById(`settings`).addEventListener(`click`, function () {
    settingsMenu.style.display ||= `none`

    // Toggle settings menu visibility
    const display = settingsMenu.style.display
    if (display === `block`) {
      resetSettings()
      settingsMenu.style.display = `none`
    } else settingsMenu.style.display = `block`
    applySettingsBtn.disabled = !hasChanges()
  })

  closeSettingsBtn.addEventListener(`click`, function () {
    resetSettings()
    settingsMenu.style.display = `none`
  })

  applySettingsBtn.addEventListener(`click`, function () {
    const selectedSize = document.querySelector(`input[name="board-size"]:checked`).value
    const isDeciseconds = document.getElementById(`timer-unit`).checked

    applySettings(selectedSize, isDeciseconds)
    settingsMenu.style.display = `none`
  })

  settingsForm.addEventListener(`change`, function () {

    
    
    applySettingsBtn.disabled = !hasChanges()
  })
}

function hasChanges() {
  const selectedSize = document.querySelector(`input[name="board-size"]:checked`).value
  const isDeciseconds = document.getElementById(`timer-unit`).checked
  return selectedSize !== currentSettings.boardSize || isDeciseconds !== currentSettings.isDeciseconds
}

function resetSettings() {
  document.querySelector(`input[name="board-size"][value="${currentSettings.boardSize}"]`).checked = true
  document.getElementById(`timer-unit`).checked = currentSettings.isDeciseconds
  applySettingsBtn.disabled = true
}

function startTimer() {
  elapsedTime = 0
  const interval = timerUnit === `deciseconds` ? 100 : 1000
  timerInterval = setInterval(() => {
    elapsedTime += timerUnit === `deciseconds` ? 1 : 1
    updateTimerDisplay()
  }, interval)
}

function stopTimer() {
  clearInterval(timerInterval)
}

function updateTimerDisplay() {
  const timerElement = document.getElementById(`timer`)
  const displayTime = timerUnit === `deciseconds` ? (elapsedTime / 10).toFixed(1) : elapsedTime
  timerElement.textContent = `⏳${displayTime}`
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
  } else {
    // Provide feedback for incorrect flag count
    for (let r = -1; r <= 1; r++) {
      for (let c = -1; c <= 1; c++) {
        if (r === 0 && c === 0) continue
        const newRow = row + r
        const newCol = col + c
        if (newRow < 0 || newRow >= boardSize || newCol < 0 || newCol >= boardSize) continue
        const cell = board[newRow][newCol].element
        if (!board[newRow][newCol].revealed) {
          cell.classList.add(`flash`)
          setTimeout(() => cell.classList.remove(`flash`), 300)
        }
      }
    }
  }
}

function revealIncorrectFlags() {
  for (let row = 0; row < boardSize; row++) {
    for (let col = 0; col < boardSize; col++) {
      const cell = board[row][col]
      if (cell.flag && !cell.mine) {
        cell.element.classList.add(`incorrect-flag`)
        cell.element.textContent = `🚩`
        const xSpan = document.createElement(`span`)
        xSpan.textContent = `❌`
        cell.element.appendChild(xSpan)
      }
    }
  }
}

setupSettings()
initBoard()
