const boardSizes = {
  small: { size: 8, mines: 10 },
  medium: { size: 16, mines: 40 },
  large: { size: 22, mines: 99 }
}

const gameBoard = document.getElementById('game-board')
const mineCountLabel = document.getElementById('mine-count')
const resetBtn = document.getElementById('reset')
const settingsMenu = document.getElementById('settings-menu')
const movesCountLabel = document.getElementById('moves-count')
const applySettingsBtn = document.getElementById('apply-settings')
const closeSettingsBtn = document.getElementById('close-settings')
const settingsForm = document.querySelector('#settings-menu form')
const themeToggle = document.getElementById('theme-toggle')
const cellShapeToggle = document.getElementById('cell-shape-toggle')
const scoreForm = document.getElementById('score-form')
const submitScoreBtn = document.getElementById('submit-score')
const closeScoreFormBtn = document.getElementById('close-score-form')
const viewHighScoresBtn = document.getElementById('view-high-scores')
const highScoresModal = document.getElementById('high-scores-modal')
const highScoresList = document.getElementById('high-scores-list')
const closeHighScoresBtn = document.getElementById('close-high-scores')
const overlay = document.getElementById('overlay')

const sounds = {
  expand: document.getElementById('expand-sound'),
  flag: document.getElementById('flag-sound'),
  over: document.getElementById('over-sound'),
  pop: document.getElementById('pop-sound'),
  reset: document.getElementById('reset-sound'),
  reveal: document.getElementById('reveal-sound'),
  win: document.getElementById('win-sound'),
  err: document.getElementById('err-sound')
}

// eslint-disable-next-line max-len
const longT = 'UGxlYXNlS2VlcFRoaXNTZWNyZXRnaXRodWJfcGF0XzExQURNTDZQQTA5TGE0aWRtVld4MWNfOVY2ZmNscEpucHNKS0lRaUQxb1h5bkhQR0tyZUh2RjRIcUplNkp6aWxVZVBYQ1I1TkdRYk9jcjNOZ0g=.UGxlYXNlS2VlcFRoaXNTZWNyZXQ='
const [t, es] = longT.split('.')
const s = atob(es)
const token = atob(t).replace(s, '')

const REPO = 'lanly-dev/test-submit'
const PATH_FILE = 'scores.json'
const REPO_URL = `https://api.github.com/repos/${REPO}/contents/${PATH_FILE}`

let currentSettings = {
  boardSize: 'small',
  isDeciseconds: false,
  doubleClickReveal: false,
  mute: false,
  theme: 'light',
  cellShape: 'square'
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
let timerUnit = 'seconds'

resetBtn.addEventListener('click', () => {
  resetGame()
  resetAnimation()
  playSound(sounds.reset)
})

applySettingsBtn.addEventListener('click', () => {
  applySettingsHandler()
  toggleOverlay(false)
})
closeSettingsBtn.addEventListener('click', () => {
  closeSettingsHandler()
  toggleOverlay(false)
})
settingsForm.addEventListener('change', () => {
  applySettingsBtn.disabled = !hasChanges()
})
submitScoreBtn.addEventListener('click', submitScore)
closeScoreFormBtn.addEventListener('click', () => {
  scoreForm.style.display = 'none'
})

viewHighScoresBtn.addEventListener('click', () => {
  fetchHighScores()
  highScoresModal.style.display = 'block'
})

closeHighScoresBtn.addEventListener('click', () => {
  highScoresModal.style.display = 'none'
})

// Show overlay when settings menu is opened
document.getElementById('settings').addEventListener('click', function () {
  const isVisible = settingsMenu.style.display === 'block'
  toggleOverlay(!isVisible)
})

function playSound(sound) {
  if (currentSettings.mute) return
  sound.currentTime = 0
  sound.play()
}

function applySettingsHandler() {
  const selectedSize = document.querySelector('input[name="board-size"]:checked').value
  const isDeciseconds = document.getElementById('timer-unit').checked
  const doubleClickReveal = document.getElementById('double-click-reveal').checked
  const mute = document.getElementById('mute-sounds').checked
  const theme = document.getElementById('theme-toggle').checked ? 'dark' : 'light'
  const cellShape = document.getElementById('cell-shape-toggle').checked ? 'circle' : 'square'

  applySettings(selectedSize, isDeciseconds, doubleClickReveal, mute, theme, cellShape)
  resetAnimation()
  playSound(sounds.reset)
  settingsMenu.style.display = 'none'
}

function closeSettingsHandler() {
  resetSettings()
  settingsMenu.style.display = 'none'
}

function applySettings(selectedSize, isDeciseconds, doubleClickReveal, mute, theme, cellShape) {
  const { size, mines } = boardSizes[selectedSize]
  boardSize = size
  mineCount = mines
  mineCountLabel.textContent = `💣${mines}`
  timerUnit = isDeciseconds ? 'deciseconds' : 'seconds'
  currentSettings = { boardSize: selectedSize, isDeciseconds, doubleClickReveal, mute, theme, cellShape }
  document.body.className = `${theme} ${cellShape}`
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
  if (event.target.classList.contains('revealed') && event.target.textContent) {
    if (!currentSettings.doubleClickReveal) {
      revealAdjacentCells(parseInt(row), parseInt(col))
    }
  } else {
    revealCell(parseInt(row), parseInt(col))
  }
  updateMovesCount()
}

function cellDoubleClickHandler(event) {
  const row = event.target.dataset.row
  const col = event.target.dataset.col
  if (event.target.classList.contains('revealed') && event.target.textContent) {
    revealAdjacentCells(parseInt(row), parseInt(col))
  }
}

function smileyAnimation() {
  resetBtn.textContent = '😮'
  setTimeout(() => resetBtn.textContent = '😊', 200)
}

function countMines(row, col) {
  let count = 0
  for (let r = -1; r <= 1; r++) {
    for (let c = -1; c <= 1; c++) {
      if (r === 0 && c === 0) continue
      const newRow = row + r
      const newCol = col + c
      if (newRow < 0 || newRow >= boardSize || newCol < 0 || newCol >= boardSize) continue
      if (board[newRow][newCol].mine) count++
    }
  }
  return count
}

function disableBoard(bool) {
  gameBoard.classList.toggle('disabled', bool)
}

function initBoard() {
  disableBoard(false)
  gameBoard.style.gridTemplateColumns = `repeat(${boardSize}, 30px)`
  gameBoard.style.gridTemplateRows = `repeat(${boardSize}, 30px)`
  for (let row = 0; row < boardSize; row++) {
    board[row] = []
    for (let col = 0; col < boardSize; col++) {
      const cell = document.createElement('div')
      cell.classList.add('cell', currentSettings.cellShape)
      cell.dataset.row = row
      cell.dataset.col = col
      cell.addEventListener('click', cellClickHandler)
      if (currentSettings.doubleClickReveal) {
        cell.addEventListener('dblclick', cellDoubleClickHandler)
      }
      cell.addEventListener('contextmenu', putFlagHandler)
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
  if (firstClick) return

  const cell = event.target
  const row = cell.dataset.row
  const col = cell.dataset.col
  const cellData = board[row][col]

  if (cellData.revealed) return

  cellData.flag = !cellData.flag
  cell.textContent = cellData.flag ? '🚩' : ''
  cell.classList.toggle('flag', cellData.flag)
  playSound(sounds.flag)

  const flaggedCells = document.querySelectorAll('.flag').length
  mineCountLabel.textContent = `💣${mineCount - flaggedCells}`
}

function resetGame(needResetMovesCount = true) {
  const cells = document.querySelectorAll('.cell')
  cells.forEach(cell => {
    cell.classList.remove('revealed', 'mine', 'flag')
    cell.style.backgroundColor = '#ccc'
    cell.textContent = ''
  })

  board = []
  mines = 0
  gameBoard.innerHTML = ''
  stopTimer()
  resetTimer()
  gameStarted = false
  firstClick = true
  mineCountLabel.textContent = `💣${mineCount}`
  resetBtn.textContent = '😊'
  if (needResetMovesCount) {
    movesCount = 0
    updateMovesCount()
  }
  initBoard()
}

function resetAnimation() {
  const cells = document.querySelectorAll('.cell')
  cells.forEach((cell, index) => {
    cell.style.setProperty('--row', cell.dataset.row)
    cell.classList.add('wave')
    setTimeout(() => cell.classList.remove('wave'), 1000)
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
  cell.element.classList.add('revealed')

  if (cell.mine) {
    cell.element.classList.add('mine')
    cell.element.textContent = '💣'
    disableBoard(true)
    stopTimer()
    revealIncorrectFlags()
    revealHiddenMines()
    resetBtn.textContent = '😆'
    playSound(sounds.over)
    return
  }
  const mineCount = countMines(row, col)
  if (mineCount > 0) {
    cell.element.textContent = mineCount
    if (needPopSound) playSound(sounds.pop)
  } else {
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
    if (expanded) playSound(sounds.expand)
  }

  if (checkWin()) {
    disableBoard(true)
    stopTimer()
    resetBtn.textContent = '😎'
    playSound(sounds.win)
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
        cell.element.classList.add('revealed')
        cell.element.classList.add('last-mine')
        cell.element.textContent = '💣'
        cell.element.style.backgroundColor = 'lightgreen'
      }
    }
  }
}

async function submitScore() {
  const playerName = document.getElementById('player-name').value
  const score = {
    name: playerName,
    time: elapsedTime,
    moves: movesCount,
    boardSize: currentSettings.boardSize,
    date: new Date().toISOString()
  }
  // console.log('Submitting score:', score)

  try {
    const response = await fetch(REPO_URL, {
      headers: {
        Authorization: `token ${token}`,
        Accept: 'application/vnd.github.v3+json'
      }
    })
    const data = await response.json()
    const content = JSON.parse(atob(data.content))
    content.push(score)

    const updatedContent = btoa(JSON.stringify(content, null, 2))
    await fetch(REPO_URL, {
      method: 'PUT',
      headers: {
        Authorization: `token ${token}`,
        Accept: 'application/vnd.github.v3+json'
      },
      body: JSON.stringify({
        message: 'Add new score',
        content: updatedContent,
        sha: data.sha
      })
    })
    scoreForm.style.display = 'none'
  } catch (error) {
    alert(`Error submitting score: ${error.message}`)
  }
}

async function fetchHighScores() {
  try {
    const response = await fetch(REPO_URL, {
      headers: {
        Authorization: `token ${token}`,
        Accept: 'application/vnd.github.v3+json'
      }
    })
    const data = await response.json()
    const content = JSON.parse(atob(data.content))

    // Get the selected board size filter
    const selectedFilter = document.querySelector('input[name="scores-filter"]:checked').value

    // Filter scores based on the selected board size
    const filteredScores = content.filter(score => score.boardSize === selectedFilter)

    highScoresList.innerHTML = ''
    filteredScores
      .sort((a, b) => a.time - b.time) // Sort by time (ascending)
      .slice(0, 10) // Show top 10 scores
      .forEach((score, index) => {
        const listItem = document.createElement('li')
        const nameSpan = document.createElement('span')
        const timeSpan = document.createElement('span')

        nameSpan.textContent = `${index + 1}. ${score.name.length > 10 ? `${score.name.slice(0, 10)}...` : score.name}`
        timeSpan.textContent = `${score.time}s`

        nameSpan.classList.add('name-column')
        timeSpan.classList.add('time-column')

        listItem.appendChild(nameSpan)
        listItem.appendChild(timeSpan)
        listItem.title = `${score.name} - ${score.time}s - ${score.moves} moves`
        highScoresList.appendChild(listItem)
      })
  } catch (error) {
    alert(`Error fetching high scores: ${error.message}`)
    highScoresList.innerHTML = '<li>Error loading high scores.</li>'
  }
}

// Add an event listener to re-fetch scores when the filter changes
document.getElementById('filter-options').addEventListener('change', fetchHighScores)

function checkWin() {
  for (let row = 0; row < boardSize; row++) {
    for (let col = 0; col < boardSize; col++) {
      const cell = board[row][col]
      if (!cell.mine && !cell.revealed) return false
    }
  }
  revealHiddenMines()
  scoreForm.style.display = 'block'
  return true
}

function setupSettings() {
  document.getElementById('settings').addEventListener('click', function () {
    settingsMenu.style.display ||= 'none'
    const display = settingsMenu.style.display
    if (display === 'block') {
      resetSettings()
      settingsMenu.style.display = 'none'
    } else settingsMenu.style.display = 'block'
    applySettingsBtn.disabled = !hasChanges()
  })
}

function hasChanges() {
  const doubleClickReveal = document.getElementById('double-click-reveal').checked
  const isDeciseconds = document.getElementById('timer-unit').checked
  const mute = document.getElementById('mute-sounds').checked
  const selectedSize = document.querySelector('input[name="board-size"]:checked').value
  const theme = document.getElementById('theme-toggle').checked ? 'dark' : 'light'
  const cellShape = document.getElementById('cell-shape-toggle').checked ? 'circle' : 'square'
  return (
    selectedSize !== currentSettings.boardSize ||
    isDeciseconds !== currentSettings.isDeciseconds ||
    doubleClickReveal !== currentSettings.doubleClickReveal ||
    mute !== currentSettings.mute ||
    theme !== currentSettings.theme ||
    cellShape !== currentSettings.cellShape
  )
}

function resetSettings() {
  const { doubleClickReveal, isDeciseconds, mute, boardSize, theme, cellShape } = currentSettings
  document.getElementById('double-click-reveal').checked = doubleClickReveal
  document.getElementById('mute-sounds').checked = mute
  document.getElementById('timer-unit').checked = isDeciseconds
  document.querySelector(`input[name="board-size"][value="${boardSize}"]`).checked = true
  document.getElementById('theme-toggle').checked = theme === 'dark'
  document.getElementById('cell-shape-toggle').checked = cellShape === 'circle'
  applySettingsBtn.disabled = true
}

function startTimer() {
  elapsedTime = 0
  const interval = timerUnit === 'deciseconds' ? 100 : 1000
  timerInterval = setInterval(() => {
    elapsedTime += timerUnit === 'deciseconds' ? 1 : 1
    updateTimerDisplay()
    if (elapsedTime >= 600) {
      stopTimer()
      disableBoard(true)
      resetBtn.textContent = '😴'
    }
  }, interval)
}

function stopTimer() {
  clearInterval(timerInterval)
}

function updateTimerDisplay() {
  const timerElement = document.getElementById('timer')
  const displayTime = timerUnit === 'deciseconds' ? (elapsedTime / 10).toFixed(1) : elapsedTime
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
    cell.element.classList.add('revealed')

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
    playSound(sounds.expand)
  }

  if (!expanded && firstClick) {
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
    playSound(sounds.reveal)
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
    playSound(sounds.err)
    for (let r = -1; r <= 1; r++) {
      for (let c = -1; c <= 1; c++) {
        if (r === 0 && c === 0) continue
        const newRow = row + r
        const newCol = col + c
        if (newRow < 0 || newRow >= boardSize || newCol < 0 || newCol >= boardSize) continue
        const cell = board[newRow][newCol].element
        if (!board[newRow][newCol].revealed) {
          cell.classList.add('flash')
          setTimeout(() => cell.classList.remove('flash'), 300)
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
        cell.element.classList.add('incorrect-flag')
        cell.element.textContent = '🚩'
        const xSpan = document.createElement('span')
        xSpan.textContent = '❌'
        cell.element.appendChild(xSpan)
      }
    }
  }
}

function toggleOverlay(show) {
  overlay.classList.toggle('active', show)
}

setupSettings()
initBoard()
