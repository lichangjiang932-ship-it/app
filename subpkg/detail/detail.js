// subpkg/detail/detail.js
Page({
  data: {
    statusBarHeight: 0,
    navBarHeight: 44,
    templateId: '',
    template: null,
    isFavorited: false,
  },

  onLoad(options) {
    const sys = wx.getSystemInfoSync();
    this.setData({ statusBarHeight: sys.statusBarHeight });
    if (options.id) {
      this.setData({ templateId: options.id });
      this.loadTemplate(options.id);
      // 读取本地收藏状态
      this.loadFavoriteStatus(options.id);
    }
  },

  async loadTemplate(id) {
    try {
      const res = await wx.cloud.callFunction({ name: 'templates', data: { action: 'detail', id } });
      if (res.result && !res.result.error) {
        this.setData({ template: res.result });
      } else {
        this.setData({ template: null });
      }
    } catch (e) {
      console.error('加载模板详情失败:', e);
      this.setData({ template: null });
    }
  },

  loadFavoriteStatus(id) {
    try {
      const favorites = wx.getStorageSync('favorites') || {};
      this.setData({ isFavorited: !!favorites[id] });
    } catch (e) {}
  },

  previewCover() {
    if (this.data.template) wx.previewImage({ urls: [this.data.template.cover] });
  },

  previewExample(e) {
    const { urls, index } = e.currentTarget.dataset;
    wx.previewImage({ current: urls[index], urls });
  },

  toggleFav() {
    const newState = !this.data.isFavorited;
    this.setData({ isFavorited: newState });
    // 持久化到本地存储
    try {
      const favorites = wx.getStorageSync('favorites') || {};
      if (newState) {
        favorites[this.data.templateId] = true;
      } else {
        delete favorites[this.data.templateId];
      }
      wx.setStorageSync('favorites', favorites);
    } catch (e) {}
    wx.showToast({ title: newState ? '已收藏' : '已取消收藏', icon: 'none' });
  },

  goCreate() {
    wx.setStorageSync('createParams', { templateId: this.data.templateId });
    wx.switchTab({ url: '/pages/create/create' });
  },

  onShareAppMessage() {
    return {
      title: `来看看「${this.data.template?.name || 'AI写真'}」效果`,
      path: `/subpkg/detail/detail?id=${this.data.templateId}`,
    };
  },
});
