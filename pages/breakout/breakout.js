Page({
  data: {
    canvasWidth: 350,
    canvasHeight: 500,
    paddle: {
      x: 150,
      y: 450,
      width: 80,
      height: 10,
      speed: 8
    },
    ball: {
      x: 175,
      y: 400,
      radius: 8,
      dx: 4,
      dy: -4,
      speed: 4
    },
    bricks: [],
    score: 0,
    lives: 3,
    gameStarted: false,
    gameOver: false,
    isWin: false,
    animationId: null,
    ctx: null,
    touchStartX: 0
  },

  onLoad() {
    this.initCanvas();
    this.initGame();
  },

  onUnload() {
    if (this.data.animationId) {
      wx.cancelAnimationFrame(this.data.animationId);
    }
  },

  // 初始化画布
  initCanvas() {
    const query = wx.createSelectorQuery();
    query.select('#gameCanvas')
      .fields({ node: true, size: true })
      .exec((res) => {
        const canvas = res[0].node;
        const ctx = canvas.getContext('2d');
        
        const dpr = wx.getSystemInfoSync().pixelRatio;
        canvas.width = this.data.canvasWidth * dpr;
        canvas.height = this.data.canvasHeight * dpr;
        ctx.scale(dpr, dpr);
        
        this.setData({ ctx: ctx });
        this.draw();
      });
  },

  // 初始化游戏
  initGame() {
    const bricks = [];
    const rows = 8;
    const cols = 7;
    const brickWidth = 45;
    const brickHeight = 20;
    const colors = ['#ff7675', '#74b9ff', '#55a3ff', '#00b894', '#fdcb6e', '#e17055', '#a29bfe'];

    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        bricks.push({
          x: col * (brickWidth + 5) + 10,
          y: row * (brickHeight + 5) + 50,
          width: brickWidth,
          height: brickHeight,
          color: colors[row % colors.length],
          visible: true
        });
      }
    }

    this.setData({
      bricks: bricks,
      score: 0,
      lives: 3,
      gameStarted: false,
      gameOver: false,
      isWin: false,
      ball: {
        x: 175,
        y: 400,
        radius: 8,
        dx: 4,
        dy: -4,
        speed: 4
      },
      paddle: {
        x: 150,
        y: 450,
        width: 80,
        height: 10,
        speed: 8
      }
    });
  },

  // 开始游戏
  startGame() {
    this.setData({ gameStarted: true });
    this.gameLoop();
  },

  // 游戏循环
  gameLoop() {
    if (!this.data.gameStarted || this.data.gameOver) return;

    this.updateBall();
    this.checkCollisions();
    this.draw();

    this.setData({
      animationId: wx.requestAnimationFrame(() => {
        this.gameLoop();
      })
    });
  },

  // 更新球的位置
  updateBall() {
    const ball = { ...this.data.ball };
    ball.x += ball.dx;
    ball.y += ball.dy;

    // 边界碰撞检测
    if (ball.x + ball.radius > this.data.canvasWidth || ball.x - ball.radius < 0) {
      ball.dx = -ball.dx;
    }
    if (ball.y - ball.radius < 0) {
      ball.dy = -ball.dy;
    }

    // 球掉落
    if (ball.y + ball.radius > this.data.canvasHeight) {
      const lives = this.data.lives - 1;
      if (lives <= 0) {
        this.gameEnd(false);
      } else {
        this.setData({
          lives: lives,
          ball: {
            x: 175,
            y: 400,
            radius: 8,
            dx: 4,
            dy: -4,
            speed: 4
          }
        });
      }
      return;
    }

    this.setData({ ball: ball });
  },

  // 碰撞检测
  checkCollisions() {
    const ball = this.data.ball;
    const paddle = this.data.paddle;

    // 球拍碰撞
    if (ball.y + ball.radius > paddle.y &&
        ball.x > paddle.x &&
        ball.x < paddle.x + paddle.width) {
      const newBall = { ...ball };
      newBall.dy = -Math.abs(newBall.dy);
      
      // 根据击中位置调整角度
      const hitPos = (ball.x - paddle.x) / paddle.width;
      newBall.dx = (hitPos - 0.5) * 8;
      
      this.setData({ ball: newBall });
    }

    // 砖块碰撞
    const bricks = [...this.data.bricks];
    let score = this.data.score;
    let hitBrick = false;

    for (let i = 0; i < bricks.length; i++) {
      const brick = bricks[i];
      if (!brick.visible) continue;

      if (ball.x + ball.radius > brick.x &&
          ball.x - ball.radius < brick.x + brick.width &&
          ball.y + ball.radius > brick.y &&
          ball.y - ball.radius < brick.y + brick.height) {
        
        brick.visible = false;
        score += 10;
        hitBrick = true;
        break;
      }
    }

    if (hitBrick) {
      const newBall = { ...ball };
      newBall.dy = -newBall.dy;
      this.setData({
        ball: newBall,
        bricks: bricks,
        score: score
      });

      // 检查是否获胜
      const visibleBricks = bricks.filter(brick => brick.visible);
      if (visibleBricks.length === 0) {
        this.gameEnd(true);
      }
    }
  },

  // 绘制游戏
  draw() {
    if (!this.data.ctx) return;

    const ctx = this.data.ctx;
    const { canvasWidth, canvasHeight, paddle, ball, bricks, score, lives } = this.data;

    // 清空画布
    ctx.fillStyle = '#2d3436';
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);

    // 绘制砖块
    bricks.forEach(brick => {
      if (brick.visible) {
        ctx.fillStyle = brick.color;
        ctx.fillRect(brick.x, brick.y, brick.width, brick.height);
        
        // 砖块边框
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1;
        ctx.strokeRect(brick.x, brick.y, brick.width, brick.height);
      }
    });

    // 绘制球拍
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(paddle.x, paddle.y, paddle.width, paddle.height);

    // 绘制球
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
    ctx.fillStyle = '#ffffff';
    ctx.fill();
    ctx.closePath();

    // 绘制分数和生命
    ctx.fillStyle = '#ffffff';
    ctx.font = '20px Arial';
    ctx.fillText(`分数: ${score}`, 10, 30);
    ctx.fillText(`生命: ${lives}`, canvasWidth - 80, 30);
  },

  // 触摸开始
  onTouchStart(e) {
    this.setData({
      touchStartX: e.touches[0].x
    });
  },

  // 触摸移动
  onTouchMove(e) {
    if (!this.data.gameStarted || this.data.gameOver) return;

    const touchX = e.touches[0].x;
    const deltaX = touchX - this.data.touchStartX;
    const paddle = { ...this.data.paddle };
    
    paddle.x += deltaX;
    
    // 边界限制
    if (paddle.x < 0) paddle.x = 0;
    if (paddle.x + paddle.width > this.data.canvasWidth) {
      paddle.x = this.data.canvasWidth - paddle.width;
    }

    this.setData({
      paddle: paddle,
      touchStartX: touchX
    });
  },

  // 游戏结束
  gameEnd(isWin) {
    if (this.data.animationId) {
      wx.cancelAnimationFrame(this.data.animationId);
    }

    this.setData({
      gameOver: true,
      isWin: isWin
    });

    wx.showToast({
      title: isWin ? '恭喜获胜！' : '游戏结束！',
      icon: isWin ? 'success' : 'none',
      duration: 2000
    });
  },

  // 重新开始
  restart() {
    if (this.data.animationId) {
      wx.cancelAnimationFrame(this.data.animationId);
    }
    this.initGame();
  }
});