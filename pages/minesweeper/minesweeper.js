Page({
  data: {
    board: [],
    gameStatus: 'ready', // ready, playing, won, lost
    mineCount: 10,
    flagCount: 0,
    rows: 9,
    cols: 9,
    firstClick: true,
    timer: 0,
    timerInterval: null
  },

  onLoad() {
    this.initGame();
  },

  onUnload() {
    if (this.data.timerInterval) {
      clearInterval(this.data.timerInterval);
    }
  },

  initGame() {
    let board = [];
    for (let i = 0; i < this.data.rows; i++) {
      board[i] = [];
      for (let j = 0; j < this.data.cols; j++) {
        board[i][j] = {
          isMine: false,
          isRevealed: false,
          isFlagged: false,
          neighborMines: 0
        };
      }
    }
    
    if (this.data.timerInterval) {
      clearInterval(this.data.timerInterval);
    }
    
    this.setData({
      board,
      gameStatus: 'ready',
      flagCount: 0,
      firstClick: true,
      timer: 0,
      timerInterval: null
    });
  },

  placeMines(excludeRow, excludeCol) {
    let minesPlaced = 0;
    let board = JSON.parse(JSON.stringify(this.data.board));
    
    while (minesPlaced < this.data.mineCount) {
      let row = Math.floor(Math.random() * this.data.rows);
      let col = Math.floor(Math.random() * this.data.cols);
      
      if (!board[row][col].isMine && !(row === excludeRow && col === excludeCol)) {
        board[row][col].isMine = true;
        minesPlaced++;
      }
    }
    
    // 计算每个格子周围的地雷数量
    for (let i = 0; i < this.data.rows; i++) {
      for (let j = 0; j < this.data.cols; j++) {
        if (!board[i][j].isMine) {
          board[i][j].neighborMines = this.countNeighborMines(board, i, j);
        }
      }
    }
    
    this.setData({board});
  },

  countNeighborMines(board, row, col) {
    let count = 0;
    for (let i = -1; i <= 1; i++) {
      for (let j = -1; j <= 1; j++) {
        let newRow = row + i;
        let newCol = col + j;
        if (newRow >= 0 && newRow < this.data.rows && 
            newCol >= 0 && newCol < this.data.cols &&
            board[newRow][newCol].isMine) {
          count++;
        }
      }
    }
    return count;
  },

  startTimer() {
    this.data.timerInterval = setInterval(() => {
      this.setData({
        timer: this.data.timer + 1
      });
    }, 1000);
  },

  onCellTap(e) {
    if (this.data.gameStatus === 'won' || this.data.gameStatus === 'lost') {
      return;
    }
    
    const {row, col} = e.currentTarget.dataset;
    const r = parseInt(row);
    const c = parseInt(col);
    const cell = this.data.board[r][c];
    
    if (cell.isFlagged || cell.isRevealed) {
      return;
    }
    
    if (this.data.firstClick) {
      this.placeMines(r, c);
      this.setData({
        firstClick: false,
        gameStatus: 'playing'
      });
      this.startTimer();
    }
    
    this.revealCell(r, c);
  },

  onCellLongPress(e) {
    if (this.data.gameStatus === 'won' || this.data.gameStatus === 'lost') {
      return;
    }
    
    const {row, col} = e.currentTarget.dataset;
    const r = parseInt(row);
    const c = parseInt(col);
    const cell = this.data.board[r][c];
    
    if (cell.isRevealed) {
      return;
    }
    
    let board = JSON.parse(JSON.stringify(this.data.board));
    let flagCount = this.data.flagCount;
    
    if (cell.isFlagged) {
      board[r][c].isFlagged = false;
      flagCount--;
    } else {
      if (flagCount < this.data.mineCount) {
        board[r][c].isFlagged = true;
        flagCount++;
      }
    }
    
    this.setData({
      board,
      flagCount
    });
    
    wx.vibrateShort();
  },

  revealCell(row, col) {
    let board = JSON.parse(JSON.stringify(this.data.board));
    const cell = board[row][col];
    
    if (cell.isRevealed || cell.isFlagged) {
      return;
    }
    
    cell.isRevealed = true;
    
    if (cell.isMine) {
      // 游戏失败
      this.revealAllMines(board);
      if (this.data.timerInterval) {
        clearInterval(this.data.timerInterval);
      }
      this.setData({
        board,
        gameStatus: 'lost'
      });
      wx.showToast({
        title: '游戏失败！',
        icon: 'none'
      });
      return;
    }
    
    // 如果是空格子，自动揭开周围的格子
    if (cell.neighborMines === 0) {
      this.revealEmptyNeighbors(board, row, col);
    }
    
    this.setData({board});
    
    // 检查是否获胜
    if (this.checkWin(board)) {
      if (this.data.timerInterval) {
        clearInterval(this.data.timerInterval);
      }
      this.setData({gameStatus: 'won'});
      wx.showToast({
        title: '恭喜获胜！',
        icon: 'success'
      });
    }
  },

  revealEmptyNeighbors(board, row, col) {
    for (let i = -1; i <= 1; i++) {
      for (let j = -1; j <= 1; j++) {
        let newRow = row + i;
        let newCol = col + j;
        if (newRow >= 0 && newRow < this.data.rows && 
            newCol >= 0 && newCol < this.data.cols &&
            !board[newRow][newCol].isRevealed &&
            !board[newRow][newCol].isFlagged) {
          
          board[newRow][newCol].isRevealed = true;
          
          if (board[newRow][newCol].neighborMines === 0) {
            this.revealEmptyNeighbors(board, newRow, newCol);
          }
        }
      }
    }
  },

  revealAllMines(board) {
    for (let i = 0; i < this.data.rows; i++) {
      for (let j = 0; j < this.data.cols; j++) {
        if (board[i][j].isMine) {
          board[i][j].isRevealed = true;
        }
      }
    }
  },

  checkWin(board) {
    for (let i = 0; i < this.data.rows; i++) {
      for (let j = 0; j < this.data.cols; j++) {
        if (!board[i][j].isMine && !board[i][j].isRevealed) {
          return false;
        }
      }
    }
    return true;
  },

  restart() {
    this.initGame();
  }
});