// 俄罗斯方块形状定义
const PIECES = {
  I: [
    [[1, 1, 1, 1]],
    [[1], [1], [1], [1]]
  ],
  O: [
    [[1, 1], [1, 1]]
  ],
  T: [
    [[0, 1, 0], [1, 1, 1]],
    [[1, 0], [1, 1], [1, 0]],
    [[1, 1, 1], [0, 1, 0]],
    [[0, 1], [1, 1], [0, 1]]
  ],
  S: [
    [[0, 1, 1], [1, 1, 0]],
    [[1, 0], [1, 1], [0, 1]]
  ],
  Z: [
    [[1, 1, 0], [0, 1, 1]],
    [[0, 1], [1, 1], [1, 0]]
  ],
  J: [
    [[1, 0, 0], [1, 1, 1]],
    [[1, 1], [1, 0], [1, 0]],
    [[1, 1, 1], [0, 0, 1]],
    [[0, 1], [0, 1], [1, 1]]
  ],
  L: [
    [[0, 0, 1], [1, 1, 1]],
    [[1, 0], [1, 0], [1, 1]],
    [[1, 1, 1], [1, 0, 0]],
    [[1, 1], [0, 1], [0, 1]]
  ]
};

const PIECE_TYPES = Object.keys(PIECES);

Page({
  data: {
    gameGrid: [],
    currentPiece: null,
    currentPosition: { x: 0, y: 0 },
    currentRotation: 0,
    nextPiece: null,
    nextPieceGrid: [],
    score: 0,
    level: 1,
    lines: 0,
    gameStarted: false,
    isPaused: false,
    showGameOverModal: false,
    gameTimer: null,
    dropSpeed: 1000
  },

  onLoad() {
    this.initGame();
  },

  onUnload() {
    if (this.data.gameTimer) {
      clearInterval(this.data.gameTimer);
    }
  },

  // 初始化游戏
  initGame() {
    const grid = Array(20).fill().map(() => Array(10).fill().map(() => ({
      value: 0,
      cellClass: ''
    })));
    this.setData({
      gameGrid: grid,
      currentPiece: null,
      nextPiece: this.getRandomPiece(),
      score: 0,
      level: 1,
      lines: 0,
      gameStarted: false,
      isPaused: false,
      showGameOverModal: false
    });
    this.updateNextPieceGrid();
    this.updateGridDisplay();
  },

  // 更新网格显示
  updateGridDisplay() {
    const { gameGrid, currentPiece, currentPosition, currentRotation } = this.data;
    
    const newGrid = gameGrid.map((row, rowIndex) => 
      row.map((cell, colIndex) => ({
        value: cell.value || 0,
        cellClass: this.getCellClass(rowIndex, colIndex, cell.value || 0)
      }))
    );
    
    this.setData({
      gameGrid: newGrid
    });
  },

  // 获取随机方块
  getRandomPiece() {
    const type = PIECE_TYPES[Math.floor(Math.random() * PIECE_TYPES.length)];
    return {
      type: type,
      shape: PIECES[type][0],
      rotations: PIECES[type]
    };
  },

  // 更新下一个方块预览
  updateNextPieceGrid() {
    const grid = Array(4).fill().map(() => Array(4).fill(false));
    if (this.data.nextPiece) {
      const shape = this.data.nextPiece.shape;
      const offsetY = Math.floor((4 - shape.length) / 2);
      const offsetX = Math.floor((4 - shape[0].length) / 2);
      
      for (let y = 0; y < shape.length; y++) {
        for (let x = 0; x < shape[y].length; x++) {
          if (shape[y][x]) {
            grid[y + offsetY][x + offsetX] = true;
          }
        }
      }
    }
    this.setData({ nextPieceGrid: grid });
  },

  // 开始游戏
  startGame() {
    this.setData({
      gameStarted: true,
      isPaused: false
    });
    this.spawnNewPiece();
    this.startGameLoop();
  },

  // 重新开始游戏
  restartGame() {
    if (this.data.gameTimer) {
      clearInterval(this.data.gameTimer);
    }
    this.setData({
      showGameOverModal: false
    });
    this.initGame();
    this.startGame();
  },

  // 生成新方块
  spawnNewPiece() {
    const piece = this.data.nextPiece;
    const startX = Math.floor((10 - piece.shape[0].length) / 2);
    
    this.setData({
      currentPiece: piece,
      currentPosition: { x: startX, y: 0 },
      currentRotation: 0,
      nextPiece: this.getRandomPiece()
    });
    
    this.updateNextPieceGrid();
    this.updateGridDisplay();
    
    // 检查游戏是否结束
    if (this.checkCollision(piece.shape, startX, 0)) {
      this.gameOver();
    }
  },

  // 开始游戏循环
  startGameLoop() {
    this.data.gameTimer = setInterval(() => {
      if (!this.data.isPaused && this.data.gameStarted) {
        this.movePieceDown();
      }
    }, this.data.dropSpeed);
  },

  // 移动方块
  movePiece(e) {
    if (!this.data.gameStarted || this.data.isPaused) return;
    
    const direction = e.currentTarget.dataset.direction;
    const { currentPiece, currentPosition, currentRotation } = this.data;
    
    if (!currentPiece) return;
    
    let newX = currentPosition.x;
    let newY = currentPosition.y;
    
    switch (direction) {
      case 'left':
        newX--;
        break;
      case 'right':
        newX++;
        break;
      case 'down':
        newY++;
        break;
    }
    
    const shape = currentPiece.rotations[currentRotation];
    if (!this.checkCollision(shape, newX, newY)) {
      this.setData({
        currentPosition: { x: newX, y: newY }
      });
      this.updateGridDisplay();
    } else if (direction === 'down') {
      this.placePiece();
    }
  },

  // 自动下落
  movePieceDown() {
    const { currentPiece, currentPosition, currentRotation } = this.data;
    if (!currentPiece) return;
    
    const shape = currentPiece.rotations[currentRotation];
    const newY = currentPosition.y + 1;
    
    if (!this.checkCollision(shape, currentPosition.x, newY)) {
      this.setData({
        currentPosition: { x: currentPosition.x, y: newY }
      });
      this.updateGridDisplay();
    } else {
      this.placePiece();
    }
  },

  // 旋转方块
  rotatePiece() {
    if (!this.data.gameStarted || this.data.isPaused) return;
    
    const { currentPiece, currentPosition, currentRotation } = this.data;
    if (!currentPiece) return;
    
    const newRotation = (currentRotation + 1) % currentPiece.rotations.length;
    const newShape = currentPiece.rotations[newRotation];
    
    if (!this.checkCollision(newShape, currentPosition.x, currentPosition.y)) {
      this.setData({ currentRotation: newRotation });
      this.updateGridDisplay();
    }
  },

  // 硬降落
  hardDrop() {
    if (!this.data.gameStarted || this.data.isPaused) return;
    
    const { currentPiece, currentPosition, currentRotation } = this.data;
    if (!currentPiece) return;
    
    const shape = currentPiece.rotations[currentRotation];
    let dropY = currentPosition.y;
    
    while (!this.checkCollision(shape, currentPosition.x, dropY + 1)) {
      dropY++;
    }
    
    this.setData({
      currentPosition: { x: currentPosition.x, y: dropY }
    });
    
    this.updateGridDisplay();
    this.placePiece();
  },

  // 检查碰撞
  checkCollision(shape, x, y) {
    const grid = this.data.gameGrid;
    
    for (let py = 0; py < shape.length; py++) {
      for (let px = 0; px < shape[py].length; px++) {
        if (shape[py][px]) {
          const newX = x + px;
          const newY = y + py;
          
          // 检查边界
          if (newX < 0 || newX >= 10 || newY >= 20) {
            return true;
          }
          
          // 检查已有方块
          if (newY >= 0) {
            const cellValue = grid[newY][newX].value || 0;
            if (cellValue) {
              return true;
            }
          }
        }
      }
    }
    
    return false;
  },

  // 放置方块
  placePiece() {
    const { currentPiece, currentPosition, currentRotation, gameGrid } = this.data;
    if (!currentPiece) return;
    
    const shape = currentPiece.rotations[currentRotation];
    const newGrid = gameGrid.map(row => row.map(cell => ({ ...cell })));
    
    // 将方块添加到网格
    for (let py = 0; py < shape.length; py++) {
      for (let px = 0; px < shape[py].length; px++) {
        if (shape[py][px]) {
          const x = currentPosition.x + px;
          const y = currentPosition.y + py;
          if (y >= 0) {
            newGrid[y][x].value = 1;
          }
        }
      }
    }
    
    this.setData({ gameGrid: newGrid });
    
    // 检查并清除完整行
    this.clearLines(newGrid);
    
    // 生成新方块
    this.spawnNewPiece();
  },

  // 清除完整行
  clearLines(grid) {
    let linesCleared = 0;
    const newGrid = [];
    
    for (let y = grid.length - 1; y >= 0; y--) {
      if (grid[y].every(cell => cell.value === 1)) {
        linesCleared++;
      } else {
        newGrid.unshift(grid[y]);
      }
    }
    
    // 添加新的空行
    while (newGrid.length < 20) {
      newGrid.unshift(Array(10).fill().map(() => ({ value: 0, cellClass: '' })));
    }
    
    if (linesCleared > 0) {
      const newLines = this.data.lines + linesCleared;
      const newLevel = Math.floor(newLines / 10) + 1;
      const scoreIncrease = linesCleared * 100 * this.data.level;
      
      this.setData({
        gameGrid: newGrid,
        lines: newLines,
        level: newLevel,
        score: this.data.score + scoreIncrease,
        dropSpeed: Math.max(100, 1000 - (newLevel - 1) * 100)
      });
      
      this.updateGridDisplay();
      
      // 更新游戏速度
      if (this.data.gameTimer) {
        clearInterval(this.data.gameTimer);
        this.startGameLoop();
      }
    }
  },

  // 获取单元格样式类
  getCellClass(row, col, value) {
    const { currentPiece, currentPosition, currentRotation } = this.data;
    
    if (value === 1) {
      return 'filled';
    }
    
    // 检查当前方块
    if (currentPiece) {
      const shape = currentPiece.rotations[currentRotation];
      const relativeY = row - currentPosition.y;
      const relativeX = col - currentPosition.x;
      
      if (relativeY >= 0 && relativeY < shape.length &&
          relativeX >= 0 && relativeX < shape[relativeY].length &&
          shape[relativeY][relativeX]) {
        return 'current';
      }
    }
    
    return '';
  },

  // 暂停/继续游戏
  togglePause() {
    if (!this.data.gameStarted) return;
    
    console.log('togglePause called, current isPaused:', this.data.isPaused);
    this.setData({
      isPaused: !this.data.isPaused
    });
  },

  // 阻止事件冒泡
  stopPropagation() {
    // 空函数，用于阻止事件冒泡
  },

  // 游戏结束
  gameOver() {
    if (this.data.gameTimer) {
      clearInterval(this.data.gameTimer);
    }
    
    this.setData({
      gameStarted: false,
      showGameOverModal: true
    });
  },

  // 返回主页
  goHome() {
    wx.navigateBack();
  }
});