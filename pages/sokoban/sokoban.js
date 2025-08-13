Page({
  data: {
    level: 1,
    moves: 0,
    grid: [],
    playerPos: { x: 0, y: 0 },
    boxes: [],
    targets: [],
    isWin: false,
    // 关卡数据
    levels: [
      {
        width: 8,
        height: 8,
        map: [
          "########",
          "#......#",
          "#..##..#",
          "#.@##@.#",
          "#......#",
          "#..@@..#",
          "#..P...#",
          "########"
        ]
      }
    ]
  },

  onLoad() {
    this.initLevel();
  },

  // 初始化关卡
  initLevel() {
    const levelData = this.data.levels[this.data.level - 1];
    const grid = [];
    const boxes = [];
    const targets = [];
    let playerPos = { x: 0, y: 0 };

    for (let y = 0; y < levelData.height; y++) {
      const row = [];
      for (let x = 0; x < levelData.width; x++) {
        const char = levelData.map[y][x];
        let cellType = 'floor';
        
        switch (char) {
          case '#':
            cellType = 'wall';
            break;
          case '@':
            cellType = 'floor';
            boxes.push({ x, y });
            break;
          case '.':
            cellType = 'target';
            targets.push({ x, y });
            break;
          case 'P':
            cellType = 'floor';
            playerPos = { x, y };
            break;
          default:
            cellType = 'floor';
        }
        
        row.push({
          type: cellType,
          x: x,
          y: y
        });
      }
      grid.push(row);
    }

    this.setData({
      grid: grid,
      boxes: boxes,
      targets: targets,
      playerPos: playerPos,
      moves: 0,
      isWin: false
    });
  },

  // 移动玩家
  movePlayer(direction) {
    if (this.data.isWin) return;

    const { x, y } = this.data.playerPos;
    let newX = x;
    let newY = y;

    switch (direction) {
      case 'up':
        newY = y - 1;
        break;
      case 'down':
        newY = y + 1;
        break;
      case 'left':
        newX = x - 1;
        break;
      case 'right':
        newX = x + 1;
        break;
    }

    // 检查边界和墙壁
    if (this.isWall(newX, newY)) return;

    // 检查是否有箱子
    const boxIndex = this.findBox(newX, newY);
    if (boxIndex !== -1) {
      // 计算箱子的新位置
      let boxNewX = newX;
      let boxNewY = newY;
      
      switch (direction) {
        case 'up':
          boxNewY = newY - 1;
          break;
        case 'down':
          boxNewY = newY + 1;
          break;
        case 'left':
          boxNewX = newX - 1;
          break;
        case 'right':
          boxNewX = newX + 1;
          break;
      }

      // 检查箱子能否移动
      if (this.isWall(boxNewX, boxNewY) || this.findBox(boxNewX, boxNewY) !== -1) {
        return;
      }

      // 移动箱子
      const boxes = [...this.data.boxes];
      boxes[boxIndex] = { x: boxNewX, y: boxNewY };
      this.setData({ boxes: boxes });
    }

    // 移动玩家
    this.setData({
      playerPos: { x: newX, y: newY },
      moves: this.data.moves + 1
    });

    // 检查是否获胜
    setTimeout(() => {
      this.checkWin();
    }, 100);
  },

  // 检查是否是墙壁
  isWall(x, y) {
    if (x < 0 || y < 0 || y >= this.data.grid.length || x >= this.data.grid[0].length) {
      return true;
    }
    return this.data.grid[y][x].type === 'wall';
  },

  // 查找箱子
  findBox(x, y) {
    return this.data.boxes.findIndex(box => box.x === x && box.y === y);
  },

  // 检查是否获胜
  checkWin() {
    const { boxes, targets } = this.data;
    
    for (let target of targets) {
      const hasBox = boxes.some(box => box.x === target.x && box.y === target.y);
      if (!hasBox) {
        return;
      }
    }

    this.setData({ isWin: true });
    wx.showToast({
      title: `恭喜过关！用了${this.data.moves}步`,
      icon: 'success',
      duration: 2000
    });
  },

  // 方向按钮点击
  onDirectionClick(e) {
    const direction = e.currentTarget.dataset.direction;
    this.movePlayer(direction);
  },

  // 重新开始
  restart() {
    this.initLevel();
  },

  // 获取单元格显示内容
  getCellContent(x, y) {
    // 检查玩家位置
    if (this.data.playerPos.x === x && this.data.playerPos.y === y) {
      return '🧑';
    }
    
    // 检查箱子位置
    const hasBox = this.data.boxes.some(box => box.x === x && box.y === y);
    if (hasBox) {
      return '📦';
    }
    
    // 检查目标位置
    const hasTarget = this.data.targets.some(target => target.x === x && target.y === y);
    if (hasTarget) {
      return '🎯';
    }
    
    return '';
  },

  // 获取单元格样式类
  getCellClass(x, y) {
    const cell = this.data.grid[y][x];
    let classes = ['cell', cell.type];
    
    // 检查是否是目标位置
    const hasTarget = this.data.targets.some(target => target.x === x && target.y === y);
    if (hasTarget) {
      classes.push('target');
    }
    
    return classes.join(' ');
  }
});