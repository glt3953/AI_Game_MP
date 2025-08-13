Page({
  data: {
    canvasWidth: 300,
    canvasHeight: 300,
    snake: [{x: 150, y: 150}],
    food: {x: 90, y: 90},
    direction: 'right',
    score: 0,
    gameRunning: false,
    gameOver: false,
    cellSize: 15
  },

  onLoad() {
    this.ctx = wx.createCanvasContext('snakeCanvas', this);
    this.generateFood();
    this.drawGame();
  },

  onUnload() {
    if (this.gameTimer) {
      clearInterval(this.gameTimer);
    }
  },

  startGame() {
    if (this.data.gameRunning) return;
    
    this.setData({
      snake: [{x: 150, y: 150}],
      direction: 'right',
      score: 0,
      gameRunning: true,
      gameOver: false
    });
    
    this.generateFood();
    this.gameTimer = setInterval(() => {
      this.moveSnake();
    }, 200);
  },

  pauseGame() {
    if (this.gameTimer) {
      clearInterval(this.gameTimer);
      this.gameTimer = null;
    }
    this.setData({
      gameRunning: false
    });
  },

  resetGame() {
    if (this.gameTimer) {
      clearInterval(this.gameTimer);
      this.gameTimer = null;
    }
    this.setData({
      snake: [{x: 150, y: 150}],
      direction: 'right',
      score: 0,
      gameRunning: false,
      gameOver: false
    });
    this.generateFood();
    this.drawGame();
  },

  moveSnake() {
    let snake = [...this.data.snake];
    let head = {...snake[0]};
    
    switch(this.data.direction) {
      case 'up':
        head.y -= this.data.cellSize;
        break;
      case 'down':
        head.y += this.data.cellSize;
        break;
      case 'left':
        head.x -= this.data.cellSize;
        break;
      case 'right':
        head.x += this.data.cellSize;
        break;
    }
    
    // 检查边界碰撞
    if (head.x < 0 || head.x >= this.data.canvasWidth || 
        head.y < 0 || head.y >= this.data.canvasHeight) {
      this.gameOver();
      return;
    }
    
    // 检查自身碰撞
    for (let segment of snake) {
      if (head.x === segment.x && head.y === segment.y) {
        this.gameOver();
        return;
      }
    }
    
    snake.unshift(head);
    
    // 检查是否吃到食物
    if (head.x === this.data.food.x && head.y === this.data.food.y) {
      this.setData({
        score: this.data.score + 10
      });
      this.generateFood();
    } else {
      snake.pop();
    }
    
    this.setData({snake});
    this.drawGame();
  },

  generateFood() {
    const x = Math.floor(Math.random() * (this.data.canvasWidth / this.data.cellSize)) * this.data.cellSize;
    const y = Math.floor(Math.random() * (this.data.canvasHeight / this.data.cellSize)) * this.data.cellSize;
    
    // 确保食物不在蛇身上
    let foodOnSnake = this.data.snake.some(segment => segment.x === x && segment.y === y);
    if (foodOnSnake) {
      this.generateFood();
      return;
    }
    
    this.setData({
      food: {x, y}
    });
  },

  drawGame() {
    this.ctx.clearRect(0, 0, this.data.canvasWidth, this.data.canvasHeight);
    
    // 绘制背景网格
    this.ctx.setStrokeStyle('#e0e0e0');
    this.ctx.setLineWidth(1);
    for (let i = 0; i <= this.data.canvasWidth; i += this.data.cellSize) {
      this.ctx.beginPath();
      this.ctx.moveTo(i, 0);
      this.ctx.lineTo(i, this.data.canvasHeight);
      this.ctx.stroke();
    }
    for (let i = 0; i <= this.data.canvasHeight; i += this.data.cellSize) {
      this.ctx.beginPath();
      this.ctx.moveTo(0, i);
      this.ctx.lineTo(this.data.canvasWidth, i);
      this.ctx.stroke();
    }
    
    // 绘制蛇
    this.data.snake.forEach((segment, index) => {
      this.ctx.setFillStyle(index === 0 ? '#4CAF50' : '#8BC34A');
      this.ctx.fillRect(segment.x, segment.y, this.data.cellSize, this.data.cellSize);
    });
    
    // 绘制食物
    this.ctx.setFillStyle('#FF5722');
    this.ctx.fillRect(this.data.food.x, this.data.food.y, this.data.cellSize, this.data.cellSize);
    
    this.ctx.draw();
  },

  gameOver() {
    if (this.gameTimer) {
      clearInterval(this.gameTimer);
      this.gameTimer = null;
    }
    this.setData({
      gameRunning: false,
      gameOver: true
    });
    wx.showToast({
      title: `游戏结束！得分：${this.data.score}`,
      icon: 'none',
      duration: 2000
    });
  },

  onTouchStart(e) {
    this.touchStartX = e.touches[0].clientX;
    this.touchStartY = e.touches[0].clientY;
  },

  onTouchEnd(e) {
    if (!this.data.gameRunning) return;
    
    const deltaX = e.changedTouches[0].clientX - this.touchStartX;
    const deltaY = e.changedTouches[0].clientY - this.touchStartY;
    
    if (Math.abs(deltaX) > Math.abs(deltaY)) {
      // 水平滑动
      if (deltaX > 30 && this.data.direction !== 'left') {
        this.setData({direction: 'right'});
      } else if (deltaX < -30 && this.data.direction !== 'right') {
        this.setData({direction: 'left'});
      }
    } else {
      // 垂直滑动
      if (deltaY > 30 && this.data.direction !== 'up') {
        this.setData({direction: 'down'});
      } else if (deltaY < -30 && this.data.direction !== 'down') {
        this.setData({direction: 'up'});
      }
    }
  },

  // 方向控制按钮
  changeDirection(e) {
    if (!this.data.gameRunning) return;
    
    const direction = e.currentTarget.dataset.direction;
    const currentDirection = this.data.direction;
    
    // 防止反向移动
    if ((direction === 'up' && currentDirection === 'down') ||
        (direction === 'down' && currentDirection === 'up') ||
        (direction === 'left' && currentDirection === 'right') ||
        (direction === 'right' && currentDirection === 'left')) {
      return;
    }
    
    this.setData({direction});
  }
});