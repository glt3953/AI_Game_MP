Page({
  data: {
    board: [],
    score: 0,
    bestScore: 0,
    gameOver: false,
    gameWon: false,
    size: 4
  },

  onLoad() {
    this.getBestScore();
    this.initGame();
  },

  initGame() {
    let board = [];
    for (let i = 0; i < this.data.size; i++) {
      board[i] = [];
      for (let j = 0; j < this.data.size; j++) {
        board[i][j] = 0;
      }
    }
    
    this.setData({
      board,
      score: 0,
      gameOver: false,
      gameWon: false
    });
    
    this.addRandomTile();
    this.addRandomTile();
  },

  addRandomTile() {
    let emptyCells = [];
    for (let i = 0; i < this.data.size; i++) {
      for (let j = 0; j < this.data.size; j++) {
        if (this.data.board[i][j] === 0) {
          emptyCells.push({x: i, y: j});
        }
      }
    }
    
    if (emptyCells.length > 0) {
      let randomCell = emptyCells[Math.floor(Math.random() * emptyCells.length)];
      let board = [...this.data.board];
      board[randomCell.x][randomCell.y] = Math.random() < 0.9 ? 2 : 4;
      this.setData({board});
    }
  },

  onTouchStart(e) {
    this.touchStartX = e.touches[0].clientX;
    this.touchStartY = e.touches[0].clientY;
  },

  onTouchEnd(e) {
    if (this.data.gameOver) return;
    
    const deltaX = e.changedTouches[0].clientX - this.touchStartX;
    const deltaY = e.changedTouches[0].clientY - this.touchStartY;
    const minSwipeDistance = 50;
    
    if (Math.abs(deltaX) > Math.abs(deltaY)) {
      if (Math.abs(deltaX) > minSwipeDistance) {
        if (deltaX > 0) {
          this.move('right');
        } else {
          this.move('left');
        }
      }
    } else {
      if (Math.abs(deltaY) > minSwipeDistance) {
        if (deltaY > 0) {
          this.move('down');
        } else {
          this.move('up');
        }
      }
    }
  },

  move(direction) {
    let board = JSON.parse(JSON.stringify(this.data.board));
    let moved = false;
    let score = this.data.score;
    
    if (direction === 'left') {
      for (let i = 0; i < this.data.size; i++) {
        let row = board[i].filter(val => val !== 0);
        for (let j = 0; j < row.length - 1; j++) {
          if (row[j] === row[j + 1]) {
            row[j] *= 2;
            score += row[j];
            row[j + 1] = 0;
            if (row[j] === 2048 && !this.data.gameWon) {
              this.setData({gameWon: true});
              wx.showToast({
                title: '恭喜！达到2048！',
                icon: 'success'
              });
            }
          }
        }
        row = row.filter(val => val !== 0);
        while (row.length < this.data.size) {
          row.push(0);
        }
        if (JSON.stringify(board[i]) !== JSON.stringify(row)) {
          moved = true;
        }
        board[i] = row;
      }
    } else if (direction === 'right') {
      for (let i = 0; i < this.data.size; i++) {
        let row = board[i].filter(val => val !== 0);
        for (let j = row.length - 1; j > 0; j--) {
          if (row[j] === row[j - 1]) {
            row[j] *= 2;
            score += row[j];
            row[j - 1] = 0;
            if (row[j] === 2048 && !this.data.gameWon) {
              this.setData({gameWon: true});
              wx.showToast({
                title: '恭喜！达到2048！',
                icon: 'success'
              });
            }
          }
        }
        row = row.filter(val => val !== 0);
        while (row.length < this.data.size) {
          row.unshift(0);
        }
        if (JSON.stringify(board[i]) !== JSON.stringify(row)) {
          moved = true;
        }
        board[i] = row;
      }
    } else if (direction === 'up') {
      for (let j = 0; j < this.data.size; j++) {
        let column = [];
        for (let i = 0; i < this.data.size; i++) {
          if (board[i][j] !== 0) {
            column.push(board[i][j]);
          }
        }
        for (let i = 0; i < column.length - 1; i++) {
          if (column[i] === column[i + 1]) {
            column[i] *= 2;
            score += column[i];
            column[i + 1] = 0;
            if (column[i] === 2048 && !this.data.gameWon) {
              this.setData({gameWon: true});
              wx.showToast({
                title: '恭喜！达到2048！',
                icon: 'success'
              });
            }
          }
        }
        column = column.filter(val => val !== 0);
        while (column.length < this.data.size) {
          column.push(0);
        }
        let originalColumn = [];
        for (let i = 0; i < this.data.size; i++) {
          originalColumn.push(board[i][j]);
        }
        if (JSON.stringify(originalColumn) !== JSON.stringify(column)) {
          moved = true;
        }
        for (let i = 0; i < this.data.size; i++) {
          board[i][j] = column[i];
        }
      }
    } else if (direction === 'down') {
      for (let j = 0; j < this.data.size; j++) {
        let column = [];
        for (let i = 0; i < this.data.size; i++) {
          if (board[i][j] !== 0) {
            column.push(board[i][j]);
          }
        }
        for (let i = column.length - 1; i > 0; i--) {
          if (column[i] === column[i - 1]) {
            column[i] *= 2;
            score += column[i];
            column[i - 1] = 0;
            if (column[i] === 2048 && !this.data.gameWon) {
              this.setData({gameWon: true});
              wx.showToast({
                title: '恭喜！达到2048！',
                icon: 'success'
              });
            }
          }
        }
        column = column.filter(val => val !== 0);
        while (column.length < this.data.size) {
          column.unshift(0);
        }
        let originalColumn = [];
        for (let i = 0; i < this.data.size; i++) {
          originalColumn.push(board[i][j]);
        }
        if (JSON.stringify(originalColumn) !== JSON.stringify(column)) {
          moved = true;
        }
        for (let i = 0; i < this.data.size; i++) {
          board[i][j] = column[i];
        }
      }
    }
    
    if (moved) {
      this.setData({
        board,
        score
      });
      
      if (score > this.data.bestScore) {
        this.setData({bestScore: score});
        this.saveBestScore(score);
      }
      
      this.addRandomTile();
      
      if (this.isGameOver()) {
        this.setData({gameOver: true});
        wx.showToast({
          title: '游戏结束！',
          icon: 'none'
        });
      }
    }
  },

  isGameOver() {
    // 检查是否还有空格
    for (let i = 0; i < this.data.size; i++) {
      for (let j = 0; j < this.data.size; j++) {
        if (this.data.board[i][j] === 0) {
          return false;
        }
      }
    }
    
    // 检查是否还能合并
    for (let i = 0; i < this.data.size; i++) {
      for (let j = 0; j < this.data.size; j++) {
        if (j < this.data.size - 1 && this.data.board[i][j] === this.data.board[i][j + 1]) {
          return false;
        }
        if (i < this.data.size - 1 && this.data.board[i][j] === this.data.board[i + 1][j]) {
          return false;
        }
      }
    }
    
    return true;
  },

  getBestScore() {
    const bestScore = wx.getStorageSync('bestScore2048') || 0;
    this.setData({bestScore});
  },

  saveBestScore(score) {
    wx.setStorageSync('bestScore2048', score);
  },

  restart() {
    this.initGame();
  },

  getCellClass(value) {
    if (value === 0) return 'cell-empty';
    return `cell-${value}`;
  }
});