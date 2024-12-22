const boardSize = 10;
const mineCount = 10;
let board = [];
let mines = 0;

function createBoard() {
  const gameBoard = document.getElementById('game-board');
  gameBoard.style.gridTemplateColumns = `repeat(${boardSize}, 30px)`;
  gameBoard.style.gridTemplateRows = `repeat(${boardSize}, 30px)`;

  for (let row = 0; row < boardSize; row++) {
    board[row] = [];
    for (let col = 0; col < boardSize; col++) {
      const cell = document.createElement('div');
      cell.classList.add('cell');
      cell.dataset.row = row;
      cell.dataset.col = col;
      cell.addEventListener('click', handleClick);
      cell.addEventListener('contextmenu', handleRightClick);
      gameBoard.appendChild(cell);
      board[row][col] = {
        element: cell,
        mine: false,
        revealed: false,
        flag: false
      };
    }
  }
  placeMines();
}

function placeMines() {
  while (mines < mineCount) {
    const row = Math.floor(Math.random() * boardSize);
    const col = Math.floor(Math.random() * boardSize);
    if (!board[row][col].mine) {
      board[row][col].mine = true;
      mines++;
    }
  }
}

function handleClick(event) {
  const row = event.target.dataset.row;
  const col = event.target.dataset.col;
  revealCell(parseInt(row), parseInt(col));
}

function handleRightClick(event) {
  event.preventDefault();
  const row = event.target.dataset.row;
  const col = event.target.dataset.col;
  toggleFlag(parseInt(row), parseInt(col));
}

function revealCell(row, col) {
  if (row < 0 || col < 0 || row >= boardSize || col >= boardSize) return;
  const cell = board[row][col];
  if (cell.revealed || cell.flag) return;

  cell.revealed = true;
  cell.element.classList.add('revealed');

  if (cell.mine) {
    cell.element.classList.add('mine');
    alert('Game Over');
    return;
  }

  const mineCount = countMines(row, col);
  if (mineCount > 0) {
    cell.element.textContent = mineCount;
  } else {
    for (let r = -1; r <= 1; r++) {
      for (let c = -1; c <= 1; c++) {
        if (r !== 0 || c !== 0) {
          revealCell(row + r, col + c);
        }
      }
    }
  }
}

function toggleFlag(row, col) {
  const cell = board[row][col];
  if (cell.revealed) return;

  cell.flag = !cell.flag;
  cell.element.classList.toggle('flag');
}

function countMines(row, col) {
  let count = 0;
  for (let r = -1; r <= 1; r++) {
    for (let c = -1; c <= 1; c++) {
      if (r === 0 && c === 0) continue;
      const newRow = row + r;
      const newCol = col + c;
      if (newRow >= 0 && newRow < boardSize && newCol >= 0 && newCol < boardSize) {
        if (board[newRow][newCol].mine) {
          count++;
        }
      }
    }
  }
  return count;
}

createBoard();