Page({
  data: {
    sudokuGrid: [],
    originalGrid: [],
    solution: [],
    selectedCell: { row: -1, col: -1 },
    selectedNumber: 0,
    difficulty: '简单',
    gameTime: 0,
    gameTimeText: '00:00',
    isPaused: false,
    showGuide: false,
    showWinModal: false,
    hintsLeft: 3,
    canUseHint: true,
    timer: null
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
    const puzzle = this.generateSudoku();
    this.setData({
      sudokuGrid: puzzle.grid,
      originalGrid: JSON.parse(JSON.stringify(puzzle.grid)),
      solution: puzzle.solution,
      gameTime: 0,
      gameTimeText: '00:00',
      isPaused: false,
      showWinModal: false,
      hintsLeft: 3,
      canUseHint: true,
      selectedCell: { row: -1, col: -1 }
    });
    this.updateGridDisplay();
    this.startTimer();
  },

  // 更新网格显示状态
  updateGridDisplay() {
    const grid = this.data.sudokuGrid.map((row, rowIndex) => 
      row.map((cell, colIndex) => ({
        ...cell,
        cellClass: this.getCellClass(rowIndex, colIndex, cell)
      }))
    );
    this.setData({
      sudokuGrid: grid
    });
  },

  // 获取单元格样式类
  getCellClass(row, col, cellValue) {
    let classes = [];
    
    if (this.data.selectedCell.row === row && this.data.selectedCell.col === col) {
      classes.push('selected');
    }
    
    if (cellValue.isHint) {
      classes.push('hint');
    }
    
    // 检查冲突
    if (cellValue.value > 0 && this.hasConflict(row, col, cellValue.value)) {
      classes.push('conflict');
    }
    
    return classes.join(' ');
  },

  // 生成数独谜题
  generateSudoku() {
    // 创建完整的数独解答
    const solution = this.createCompleteSudoku();
    
    // 创建谜题（移除一些数字）
    const grid = JSON.parse(JSON.stringify(solution));
    const cellsToRemove = 40; // 简单难度移除40个数字
    
    for (let i = 0; i < cellsToRemove; i++) {
      let row, col;
      do {
        row = Math.floor(Math.random() * 9);
        col = Math.floor(Math.random() * 9);
      } while (grid[row][col].value === 0);
      
      grid[row][col] = {
        value: 0,
        isOriginal: false,
        notes: [],
        isHint: false
      };
    }
    
    return { grid, solution };
  },

  // 创建完整的数独解答
  createCompleteSudoku() {
    const grid = Array(9).fill().map(() => 
      Array(9).fill().map(() => ({
        value: 0,
        isOriginal: true,
        notes: [],
        isHint: false
      }))
    );

    // 使用更好的数独生成算法
    this.fillSudokuGrid(grid);
    
    return grid;
  },

  // 填充数独网格
  fillSudokuGrid(grid) {
    // 先填充对角线上的3个3x3宫格
    for (let i = 0; i < 9; i += 3) {
      this.fillBox(grid, i, i);
    }
    
    // 然后填充剩余的格子
    this.solveSudoku(grid);
  },

  // 填充3x3宫格
  fillBox(grid, row, col) {
    const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9];
    // 随机打乱数字
    for (let i = numbers.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [numbers[i], numbers[j]] = [numbers[j], numbers[i]];
    }
    
    let index = 0;
    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {
        grid[row + i][col + j].value = numbers[index++];
      }
    }
  },

  // 数独求解算法
  solveSudoku(grid) {
    for (let row = 0; row < 9; row++) {
      for (let col = 0; col < 9; col++) {
        if (grid[row][col].value === 0) {
          for (let num = 1; num <= 9; num++) {
            if (this.isValidMove(grid, row, col, num)) {
              grid[row][col].value = num;
              if (this.solveSudoku(grid)) {
                return true;
              }
              grid[row][col].value = 0;
            }
          }
          return false;
        }
      }
    }
    return true;
  },

  // 检查移动是否有效
  isValidMove(grid, row, col, num) {
    // 检查行
    for (let c = 0; c < 9; c++) {
      if (grid[row][c].value === num) return false;
    }
    
    // 检查列
    for (let r = 0; r < 9; r++) {
      if (grid[r][col].value === num) return false;
    }
    
    // 检查3x3宫格
    const boxRow = Math.floor(row / 3) * 3;
    const boxCol = Math.floor(col / 3) * 3;
    for (let r = boxRow; r < boxRow + 3; r++) {
      for (let c = boxCol; c < boxCol + 3; c++) {
        if (grid[r][c].value === num) return false;
      }
    }
    
    return true;
  },

  // 检查是否有冲突
  hasConflict(row, col, num) {
    const grid = this.data.sudokuGrid;
    
    // 检查行冲突
    for (let c = 0; c < 9; c++) {
      if (c !== col && grid[row][c].value === num) return true;
    }
    
    // 检查列冲突
    for (let r = 0; r < 9; r++) {
      if (r !== row && grid[r][col].value === num) return true;
    }
    
    // 检查宫格冲突
    const boxRow = Math.floor(row / 3) * 3;
    const boxCol = Math.floor(col / 3) * 3;
    for (let r = boxRow; r < boxRow + 3; r++) {
      for (let c = boxCol; c < boxCol + 3; c++) {
        if ((r !== row || c !== col) && grid[r][c].value === num) return true;
      }
    }
    
    return false;
  },

  // 选择单元格
  selectCell(e) {
    const { row, col } = e.currentTarget.dataset;
    const r = parseInt(row);
    const c = parseInt(col);
    
    if (this.data.originalGrid[r][c].isOriginal) {
      return; // 不能选择原始数字
    }
    
    this.setData({
      selectedCell: { row: r, col: c },
      selectedNumber: this.data.sudokuGrid[r][c].value || 0
    });
    this.updateGridDisplay();
  },

  // 输入数字
  inputNumber(e) {
    const number = parseInt(e.currentTarget.dataset.number);
    const { row, col } = this.data.selectedCell;
    
    if (row === -1 || col === -1) return;
    
    const grid = this.data.sudokuGrid;
    grid[row][col].value = number;
    grid[row][col].notes = []; // 清除笔记
    
    this.setData({
      sudokuGrid: grid,
      selectedNumber: number
    });
    
    this.updateGridDisplay();
    
    // 检查是否完成
    if (this.checkComplete()) {
      this.gameWin();
    }
  },

  // 清除单元格
  clearCell() {
    const { row, col } = this.data.selectedCell;
    if (row === -1 || col === -1) return;
    
    const grid = this.data.sudokuGrid;
    grid[row][col].value = 0;
    grid[row][col].notes = [];
    
    this.setData({
      sudokuGrid: grid,
      selectedNumber: 0
    });
    
    this.updateGridDisplay();
  },

  // 切换笔记模式
  toggleNote(e) {
    const { row, col } = e.currentTarget.dataset;
    const r = parseInt(row);
    const c = parseInt(col);
    
    if (this.data.originalGrid[r][c].isOriginal) return;
    
    // 这里可以实现笔记功能
    console.log('长按单元格，可以添加笔记功能');
  },

  // 显示提示
  showHint() {
    if (!this.data.canUseHint || this.data.hintsLeft <= 0) return;
    
    const { row, col } = this.data.selectedCell;
    if (row === -1 || col === -1) return;
    
    const correctValue = this.data.solution[row][col].value;
    const grid = this.data.sudokuGrid;
    
    grid[row][col].value = correctValue;
    grid[row][col].isHint = true;
    
    this.setData({
      sudokuGrid: grid,
      hintsLeft: this.data.hintsLeft - 1,
      canUseHint: this.data.hintsLeft > 1
    });
    
    this.updateGridDisplay();
    
    if (this.checkComplete()) {
      this.gameWin();
    }
  },

  // 切换新手引导
  toggleGuide() {
    this.setData({
      showGuide: !this.data.showGuide
    });
  },

  // 开始计时器
  startTimer() {
    if (this.data.timer) {
      clearInterval(this.data.timer);
    }
    
    this.data.timer = setInterval(() => {
      if (!this.data.isPaused) {
        const newTime = this.data.gameTime + 1;
        this.setData({
          gameTime: newTime,
          gameTimeText: this.formatTime(newTime)
        });
      }
    }, 1000);
  },

  // 暂停游戏
  pauseGame() {
    this.setData({
      isPaused: !this.data.isPaused
    });
  },

  // 检查解答
  checkSolution() {
    let correct = 0;
    let total = 0;
    
    for (let row = 0; row < 9; row++) {
      for (let col = 0; col < 9; col++) {
        if (this.data.sudokuGrid[row][col].value > 0) {
          total++;
          if (this.data.sudokuGrid[row][col].value === this.data.solution[row][col].value) {
            correct++;
          }
        }
      }
    }
    
    wx.showToast({
      title: `正确: ${correct}/${total}`,
      icon: 'none'
    });
  },

  // 检查是否完成
  checkComplete() {
    for (let row = 0; row < 9; row++) {
      for (let col = 0; col < 9; col++) {
        if (this.data.sudokuGrid[row][col].value === 0) {
          return false;
        }
        if (this.data.sudokuGrid[row][col].value !== this.data.solution[row][col].value) {
          return false;
        }
      }
    }
    return true;
  },

  // 游戏胜利
  gameWin() {
    if (this.data.timer) {
      clearInterval(this.data.timer);
    }
    
    this.setData({
      showWinModal: true,
      isPaused: true
    });
  },

  // 新游戏
  newGame() {
    this.setData({
      showWinModal: false
    });
    this.initGame();
  },

  // 返回主页
  goHome() {
    wx.navigateBack();
  },

  // 格式化时间
  formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
});