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
  }
});