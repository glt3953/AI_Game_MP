Page({
  data: {
    gridSize: 8, // 8x8网格
    grid: [],
    selectedTiles: [],
    score: 0,
    timeLeft: 300, // 5分钟
    gameStarted: false,
    gameOver: false,
    isWin: false,
    timer: null,
    icons: ['🍎', '🍌', '🍇', '🍊', '🍓', '🥝', '🍑', '🍒', '🥭', '🍍', '🥥', '🍉', '🍈', '🥑', '🍅', '🥕']
  },

  onLoad() {
    this.initGame();
  },

  onUnload() {
    if (this.data.timer) {
      clearInterval(this.data.timer);
    }
  },

  // 初始化游戏
  initGame() {
    const size = this.data.gridSize;
    const totalTiles = size * size;
    const pairCount = totalTiles / 2;
    const icons = this.data.icons.slice(0, pairCount);
    
    // 创建成对的图标
    const tiles = [];
    icons.forEach(icon => {
      tiles.push(icon, icon);
    });
    
    // 打乱数组
    this.shuffleArray(tiles);
    
    // 创建网格
    const grid = [];
    for (let i = 0; i < size; i++) {
      const row = [];
      for (let j = 0; j < size; j++) {
        row.push({
          icon: tiles[i * size + j],
          visible: false,
          matched: false,
          row: i,
          col: j
        });
      }
      grid.push(row);
    }

    this.setData({
      grid: grid,
      selectedTiles: [],
      score: 0,
      timeLeft: 300,
      gameStarted: false,
      gameOver: false,
      isWin: false
    });
  },

  // 打乱数组
  shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
  },

  // 开始游戏
  startGame() {
    this.setData({
      gameStarted: true
    });
    
    this.startTimer();
  },

  // 开始计时器
  startTimer() {
    const timer = setInterval(() => {
      const timeLeft = this.data.timeLeft - 1;
      this.setData({
        timeLeft: timeLeft
      });
      
      if (timeLeft <= 0) {
        clearInterval(timer);
        this.gameEnd(false);
      }
    }, 1000);
    
    this.setData({
      timer: timer
    });
  },

  // 点击方块
  onTileClick(e) {
    if (!this.data.gameStarted || this.data.gameOver) return;
    
    const { row, col } = e.currentTarget.dataset;
    const grid = this.data.grid;
    const tile = grid[row][col];
    
    if (tile.matched || tile.visible) return;
    
    // 显示方块
    tile.visible = true;
    const selectedTiles = [...this.data.selectedTiles, { row, col }];
    
    this.setData({
      grid: grid,
      selectedTiles: selectedTiles
    });
    
    // 检查匹配
    if (selectedTiles.length === 2) {
      setTimeout(() => {
        this.checkMatch();
      }, 500);
    }
  },

  // 检查匹配
  checkMatch() {
    const grid = this.data.grid;
    const selectedTiles = this.data.selectedTiles;
    const tile1 = grid[selectedTiles[0].row][selectedTiles[0].col];
    const tile2 = grid[selectedTiles[1].row][selectedTiles[1].col];
    
    if (tile1.icon === tile2.icon && this.canConnect(selectedTiles[0], selectedTiles[1])) {
      // 匹配成功
      tile1.matched = true;
      tile2.matched = true;
      
      const score = this.data.score + 10;
      this.setData({
        grid: grid,
        selectedTiles: [],
        score: score
      });
      
      // 检查是否获胜
      if (this.checkWin()) {
        this.gameEnd(true);
      }
    } else {
      // 匹配失败，隐藏方块
      tile1.visible = false;
      tile2.visible = false;
      
      this.setData({
        grid: grid,
        selectedTiles: []
      });
    }
  },

  // 检查是否可以连接（简化版，只检查直线连接）
  canConnect(pos1, pos2) {
    // 同行或同列的直线连接
    if (pos1.row === pos2.row) {
      return this.checkHorizontalPath(pos1, pos2);
    } else if (pos1.col === pos2.col) {
      return this.checkVerticalPath(pos1, pos2);
    }
    return false;
  },

  // 检查水平路径
  checkHorizontalPath(pos1, pos2) {
    const row = pos1.row;
    const startCol = Math.min(pos1.col, pos2.col);
    const endCol = Math.max(pos1.col, pos2.col);
    
    for (let col = startCol + 1; col < endCol; col++) {
      if (!this.data.grid[row][col].matched) {
        return false;
      }
    }
    return true;
  },

  // 检查垂直路径
  checkVerticalPath(pos1, pos2) {
    const col = pos1.col;
    const startRow = Math.min(pos1.row, pos2.row);
    const endRow = Math.max(pos1.row, pos2.row);
    
    for (let row = startRow + 1; row < endRow; row++) {
      if (!this.data.grid[row][col].matched) {
        return false;
      }
    }
    return true;
  },

  // 检查是否获胜
  checkWin() {
    const grid = this.data.grid;
    for (let i = 0; i < grid.length; i++) {
      for (let j = 0; j < grid[i].length; j++) {
        if (!grid[i][j].matched) {
          return false;
        }
      }
    }
    return true;
  },

  // 游戏结束
  gameEnd(isWin) {
    if (this.data.timer) {
      clearInterval(this.data.timer);
    }
    
    this.setData({
      gameOver: true,
      isWin: isWin
    });
    
    if (isWin) {
      wx.showToast({
        title: '恭喜获胜！',
        icon: 'success'
      });
    } else {
      wx.showToast({
        title: '时间到！',
        icon: 'none'
      });
    }
  },

  // 重新开始
  restart() {
    if (this.data.timer) {
      clearInterval(this.data.timer);
    }
    this.initGame();
  },

  // 格式化时间
  formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  }
});