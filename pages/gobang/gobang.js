Page({
  data: {
    board: [],
    currentPlayer: 1, // 1为黑子，2为白子
    gameStatus: 'playing', // playing, won, draw
    winner: 0,
    boardSize: 15,
    lastMove: null
  },

  onLoad() {
    this.initGame();
  },

  initGame() {
    let board = [];
    for (let i = 0; i < this.data.boardSize; i++) {
      board[i] = [];
      for (let j = 0; j < this.data.boardSize; j++) {
        board[i][j] = 0; // 0为空，1为黑子，2为白子
      }
    }
    
    this.setData({
      board,
      currentPlayer: 1,
      gameStatus: 'playing',
      winner: 0,
      lastMove: null
    });
  },

  onCellTap(e) {
    if (this.data.gameStatus !== 'playing') {
      return;
    }
    
    const {row, col} = e.currentTarget.dataset;
    const r = parseInt(row);
    const c = parseInt(col);
    
    if (this.data.board[r][c] !== 0) {
      return; // 该位置已有棋子
    }
    
    let board = JSON.parse(JSON.stringify(this.data.board));
    board[r][c] = this.data.currentPlayer;
    
    this.setData({
      board,
      lastMove: {row: r, col: c}
    });
    
    // 检查是否获胜
    if (this.checkWin(r, c, this.data.currentPlayer)) {
      this.setData({
        gameStatus: 'won',
        winner: this.data.currentPlayer
      });
      
      wx.showToast({
        title: `${this.data.currentPlayer === 1 ? '黑子' : '白子'}获胜！`,
        icon: 'success'
      });
      return;
    }
    
    // 检查是否平局
    if (this.checkDraw()) {
      this.setData({
        gameStatus: 'draw'
      });
      wx.showToast({
        title: '平局！',
        icon: 'none'
      });
      return;
    }
    
    // 切换玩家
    this.setData({
      currentPlayer: this.data.currentPlayer === 1 ? 2 : 1
    });
  },

  checkWin(row, col, player) {
    const directions = [
      [0, 1],   // 水平
      [1, 0],   // 垂直
      [1, 1],   // 主对角线
      [1, -1]   // 副对角线
    ];
    
    for (let [dx, dy] of directions) {
      let count = 1; // 包含当前棋子
      
      // 向一个方向检查
      let r = row + dx;
      let c = col + dy;
      while (r >= 0 && r < this.data.boardSize && 
             c >= 0 && c < this.data.boardSize && 
             this.data.board[r][c] === player) {
        count++;
        r += dx;
        c += dy;
      }
      
      // 向相反方向检查
      r = row - dx;
      c = col - dy;
      while (r >= 0 && r < this.data.boardSize && 
             c >= 0 && c < this.data.boardSize && 
             this.data.board[r][c] === player) {
        count++;
        r -= dx;
        c -= dy;
      }
      
      if (count >= 5) {
        return true;
      }
    }
    
    return false;
  },

  checkDraw() {
    for (let i = 0; i < this.data.boardSize; i++) {
      for (let j = 0; j < this.data.boardSize; j++) {
        if (this.data.board[i][j] === 0) {
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