Page({
  data: {
    gridSize: 3, // 3x3拼图
    tiles: [],
    emptyIndex: 8, // 空白块的位置
    moves: 0,
    isWin: false,
    gameStarted: false
  },

  onLoad() {
    this.initGame();
  },

  // 初始化游戏
  initGame() {
    const size = this.data.gridSize;
    const tiles = [];
    
    // 创建拼图块
    for (let i = 0; i < size * size - 1; i++) {
      tiles.push({
        number: i + 1,
        index: i,
        isEmpty: false
      });
    }
    
    // 添加空白块
    tiles.push({
      number: 0,
      index: size * size - 1,
      isEmpty: true
    });

    this.setData({
      tiles: tiles,
      emptyIndex: size * size - 1,
      moves: 0,
      isWin: false,
      gameStarted: false
    });
  },

  // 打乱拼图
  shufflePuzzle() {
    let tiles = [...this.data.tiles];
    let emptyIndex = this.data.emptyIndex;
    
    // 随机移动1000次来打乱
    for (let i = 0; i < 1000; i++) {
      const neighbors = this.getNeighbors(emptyIndex);
      const randomNeighbor = neighbors[Math.floor(Math.random() * neighbors.length)];
      
      // 交换空白块和随机邻居
      [tiles[emptyIndex], tiles[randomNeighbor]] = [tiles[randomNeighbor], tiles[emptyIndex]];
      emptyIndex = randomNeighbor;
    }

    this.setData({
      tiles: tiles,
      emptyIndex: emptyIndex,
      moves: 0,
      isWin: false,
      gameStarted: true
    });
  },

  // 获取邻居位置
  getNeighbors(index) {
    const size = this.data.gridSize;
    const row = Math.floor(index / size);
    const col = index % size;
    const neighbors = [];

    // 上
    if (row > 0) neighbors.push((row - 1) * size + col);
    // 下
    if (row < size - 1) neighbors.push((row + 1) * size + col);
    // 左
    if (col > 0) neighbors.push(row * size + (col - 1));
    // 右
    if (col < size - 1) neighbors.push(row * size + (col + 1));

    return neighbors;
  },

  // 点击拼图块
  onTileClick(e) {
    if (!this.data.gameStarted || this.data.isWin) return;

    const index = e.currentTarget.dataset.index;
    const emptyIndex = this.data.emptyIndex;
    
    // 检查是否可以移动
    const neighbors = this.getNeighbors(emptyIndex);
    if (!neighbors.includes(index)) return;

    // 移动拼图块
    let tiles = [...this.data.tiles];
    [tiles[emptyIndex], tiles[index]] = [tiles[index], tiles[emptyIndex]];

    const moves = this.data.moves + 1;
    const isWin = this.checkWin(tiles);

    this.setData({
      tiles: tiles,
      emptyIndex: index,
      moves: moves,
      isWin: isWin
    });

    if (isWin) {
      wx.showToast({
        title: `恭喜完成！用了${moves}步`,
        icon: 'success',
        duration: 2000
      });
    }
  },

  // 检查是否获胜
  checkWin(tiles) {
    for (let i = 0; i < tiles.length - 1; i++) {
      if (tiles[i].number !== i + 1) {
        return false;
      }
    }
    return tiles[tiles.length - 1].isEmpty;
  },

  // 重新开始
  restart() {
    this.initGame();
  }
});