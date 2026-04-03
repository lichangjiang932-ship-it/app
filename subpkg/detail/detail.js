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
    }
  },

  async loadTemplate(id) {
    try {
      const res = await wx.cloud.callFunction({ name: 'templates', data: { action: 'detail', id } });
      if (res.result) this.setData({ template: res.result });
    } catch (e) {
      this.setData({
        template: {
          id, name: '法式油画写真', cover: '/images/demo/template2.jpg', style: '写真',
          description: '文艺复兴风格的油画质感写真，让你瞬间变身油画中的主角，优雅而永恒。',
          useCount: 96000, likeCount: 45000, price: 0, isNew: true, isHot: true,
          examples: ['/images/demo/result1.jpg', '/images/demo/result2.jpg', '/images/demo/result3.jpg'],
        },
      });
    }
  },

  previewCover() {
    if (this.data.template) wx.previewImage({ urls: [this.data.template.cover] });
  },

  previewExample(e) {
    const { urls, index } = e.currentTarget.dataset;
    wx.previewImage({ current: urls[index], urls });
  },

  toggleFav() {
    this.setData({ isFavorited: !this.data.isFavorited });
    wx.showToast({ title: this.data.isFavorited ? '已收藏' : '已取消', icon: 'none' });
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
