const boardSizes = {
  small: { size: 8, mines: 10 },
  medium: { size: 16, mines: 40 },
  large: { size: 22, mines: 99 }
}
const gameBoard = document.getElementById(`game-board`)
const mineCountLabel = document.getElementById(`mine-count`)
const resetBtn = document.getElementById(`reset`)
const settingsMenu = document.getElementById(`settings-menu`)
const movesCountLabel = document.getElementById(`moves-count`)
resetBtn.addEventListener(`click`, () => {
  resetGame()
  resetAnimation()
  playSound(resetSound)
})

const applySettingsBtn = document.getElementById(`apply-settings`)
const closeSettingsBtn = document.getElementById(`close-settings`)
const settingsForm = document.querySelector(`#settings-menu form`)
let currentSettings = {
  boardSize: `small`,
  isDeciseconds: false,
  doubleClickReveal: false,
  mute: false
}

let board = []
let boardSize = boardSizes.small.size
let mineCount = boardSizes.small.mines

let elapsedTime = 0
let firstClick = true
let gameStarted = false
let mines = 0
let movesCount = 0
let timerInterval
let timerUnit = `seconds`

const expandSound = document.getElementById(`expand-sound`)
const flagSound = document.getElementById(`flag-sound`)
const overSound = document.getElementById(`over-sound`)
const popSound = document.getElementById(`pop-sound`)
const resetSound = document.getElementById(`reset-sound`)
const revealSound = document.getElementById(`reveal-sound`)
const winSound = document.getElementById(`win-sound`)
const errSound = document.getElementById(`err-sound`)

function playSound(sound) {
  if (currentSettings.mute) return
  sound.currentTime = 0
  sound.play()
}

function applySettings(selectedSize, isDeciseconds, doubleClickReveal, mute) {
  const { size, mines } = boardSizes[selectedSize]
  boardSize = size
  mineCount = mines
  mineCountLabel.textContent = `💣${mines}`
  timerUnit = isDeciseconds ? `deciseconds` : `seconds`
  currentSettings = { boardSize: selectedSize, isDeciseconds, doubleClickReveal, mute }
  resetGame()
}

function cellClickHandler(event) {
  const row = event.target.dataset.row
  const col = event.target.dataset.col
  movesCount++
  if (firstClick) {
    ensureSafeFirstClick(event.target)
    firstClick = false
    gameStarted = true
    smileyAnimation()
    startTimer()
  }
  // Check if the clicked cell is already revealed and has content
  if (event.target.classList.contains(`revealed`) && event.target.textContent) {
    // If double-click reveal is disabled, reveal adjacent cells
    if (!currentSettings.doubleClickReveal) {
      revealAdjacentCells(parseInt(row), parseInt(col))
    }
  } else {
    // Otherwise, reveal the clicked cell
    revealCell(parseInt(row), parseInt(col))
  }
  updateMovesCount()
}

function cellDoubleClickHandler(event) {
  const row = event.target.dataset.row
  const col = event.target.dataset.col
  if (event.target.classList.contains(`revealed`) && event.target.textContent) {
    revealAdjacentCells(parseInt(row), parseInt(col))
  }
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
      if (currentSettings.doubleClickReveal) {
        cell.addEventListener(`dblclick`, cellDoubleClickHandler)
      }
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
  playSound(flagSound)

  const flaggedCells = document.querySelectorAll(`.flag`).length
  mineCountLabel.textContent = `💣${mineCount - flaggedCells}`
}

function resetGame(needResetMovesCount = true) {
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
  mineCountLabel.textContent = `💣${mineCount}`
  resetBtn.textContent = `😊`
  if (needResetMovesCount) {
    movesCount = 0
    updateMovesCount()
  }
  initBoard()
}

function resetAnimation() {
  const cells = document.querySelectorAll(`.cell`)
  cells.forEach((cell, index) => {
    cell.style.setProperty(`--row`, cell.dataset.row)
    cell.classList.add(`wave`)
    setTimeout(() => cell.classList.remove(`wave`), 1000) // Increase animation duration
  })
}

function resetTimer() {
  elapsedTime = 0
  updateTimerDisplay()
}

function revealCell(row, col, needPopSound = true) {
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
    revealIncorrectFlags()
    resetBtn.textContent = `😆`
    playSound(overSound)
    return
  }
  const mineCount = countMines(row, col)
  if (mineCount > 0) {
    cell.element.textContent = mineCount
    if (needPopSound) playSound(popSound)
  } else {
    // Reveal adjacent cells
    let expanded = false
    for (let r = -1; r <= 1; r++) {
      for (let c = -1; c <= 1; c++) {
        if (r !== 0 || c !== 0) {
          const newRow = row + r
          const newCol = col + c
          if (newRow >= 0 && newRow < boardSize && newCol >= 0 && newCol < boardSize) {
            revealCell(newRow, newCol, false)
            expanded = true
          }
        }
      }
    }
    if (expanded) playSound(expandSound)
  }

  // Check for win condition
  if (checkWin()) {
    disableBoard(true)
    stopTimer()
    resetBtn.textContent = `😎`
    playSound(winSound)
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
    const doubleClickReveal = document.getElementById(`double-click-reveal`).checked
    const mute = document.getElementById(`mute-sounds`).checked

    applySettings(selectedSize, isDeciseconds, doubleClickReveal, mute)
    settingsMenu.style.display = `none`
  })

  settingsForm.addEventListener(`change`, function () {
    applySettingsBtn.disabled = !hasChanges()
  })
}

function hasChanges() {
  const selectedSize = document.querySelector(`input[name="board-size"]:checked`).value
  const isDeciseconds = document.getElementById(`timer-unit`).checked
  const doubleClickReveal = document.getElementById(`double-click-reveal`).checked
  const mute = document.getElementById(`mute-sounds`).checked
  return selectedSize !== currentSettings.boardSize || isDeciseconds !== currentSettings.isDeciseconds || doubleClickReveal !== currentSettings.doubleClickReveal || mute !== currentSettings.mute
}

function resetSettings() {
  document.querySelector(`input[name="board-size"][value="${currentSettings.boardSize}"]`).checked = true
  document.getElementById(`timer-unit`).checked = currentSettings.isDeciseconds
  document.getElementById(`double-click-reveal`).checked = currentSettings.doubleClickReveal
  document.getElementById(`mute-sounds`).checked = currentSettings.mute
  applySettingsBtn.disabled = true
}

function startTimer() {
  elapsedTime = 0
  const interval = timerUnit === `deciseconds` ? 100 : 1000
  timerInterval = setInterval(() => {
    elapsedTime += timerUnit === `deciseconds` ? 1 : 1
    updateTimerDisplay()
    if (elapsedTime >= 600) { // 10 minutes in seconds
      stopTimer()
      disableBoard(true)
      resetBtn.textContent = `😴`
    }
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

function updateMovesCount() {
  movesCountLabel.textContent = `👣${movesCount}`
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

  if (expanded) {
    playSound(expandSound)
  }

  if (!expanded && firstClick) {
    // If no expansion happened on the first click, reset the board and try again
    resetGame(false)
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
    playSound(revealSound)
    for (let r = -1; r <= 1; r++) {
      for (let c = -1; c <= 1; c++) {
        if (r === 0 && c === 0) continue
        const newRow = row + r
        const newCol = col + c
        if (newRow < 0 || newRow >= boardSize || newCol < 0 || newCol >= boardSize) continue
        revealCell(newRow, newCol, false)
      }
    }
  } else {
    playSound(errSound)
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
