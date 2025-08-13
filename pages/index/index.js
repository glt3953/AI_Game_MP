Page({
  data: {},

  onLoad() {
    console.log('主页加载完成');
  },

  // 跳转到数独游戏
  goToSudoku() {
    wx.navigateTo({
      url: '/pages/sudoku/sudoku'
    });
  },

  // 跳转到俄罗斯方块游戏
  goToTetris() {
    wx.navigateTo({
      url: '/pages/tetris/tetris'
    });
  },

  // 跳转到贪吃蛇游戏
  goToSnake() {
    wx.navigateTo({
      url: '/pages/snake/snake'
    });
  },

  // 跳转到2048游戏
  goTo2048() {
    wx.navigateTo({
      url: '/pages/game2048/game2048'
    });
  },

  // 跳转到扫雷游戏
  goToMinesweeper() {
    wx.navigateTo({
      url: '/pages/minesweeper/minesweeper'
    });
  },

  // 跳转到五子棋游戏
  goToGobang() {
    wx.navigateTo({
      url: '/pages/gobang/gobang'
    });
  }
});