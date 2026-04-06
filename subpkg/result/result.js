// subpkg/result/result.js
Page({
  data: {
    statusBarHeight: 0,
    navBarHeight: 44,
    taskId: '',
    task: null,
    currentThumb: 0,
    recommendTemplates: [],
    saving: false,
  },

  onLoad(options) {
    const sys = wx.getSystemInfoSync();
    this.setData({ statusBarHeight: sys.statusBarHeight });
    if (options.taskId) {
      this.setData({ taskId: options.taskId });
      this.loadResult(options.taskId);
    }
    this.loadRecommend();
  },

  async loadResult(taskId) {
    try {
      const res = await wx.cloud.callFunction({ name: 'tasks', data: { action: 'detail', taskId } });
      if (res.result) {
        this.setData({ task: res.result });
      } else {
        this.setData({ task: null });
      }
    } catch (e) {
      console.error('加载结果失败:', e);
      this.setData({ task: null });
    }
  },

  switchThumb(e) {
    this.setData({ currentThumb: e.currentTarget.dataset.index });
  },

  previewImage(e) {
    wx.previewImage({ current: e.currentTarget.dataset.url, urls: e.currentTarget.dataset.urls });
  },

  async saveToAlbum() {
    if (!this.data.task || this.data.saving) return;
    const url = this.data.task.results[this.data.currentThumb];
    this.setData({ saving: true });
    wx.showLoading({ title: '保存中...' });
    try {
      const res = await wx.cloud.downloadFile({ fileID: url });
      await wx.saveImageToPhotosAlbum({ filePath: res.tempFilePath });
      wx.hideLoading();
      wx.showToast({ title: '已保存到相册', icon: 'success' });
    } catch (e) {
      wx.hideLoading();
      // 可能是权限问题
      if (e.errMsg && e.errMsg.includes('auth deny')) {
        wx.showModal({
          title: '需要相册权限',
          content: '请在设置中允许访问相册',
          confirmText: '去设置',
          success: (r) => { if (r.confirm) wx.openSetting(); },
        });
      } else {
        wx.showToast({ title: '保存失败', icon: 'none' });
      }
    }
    this.setData({ saving: false });
  },

  async saveAll() {
    if (!this.data.task || this.data.saving) return;
    this.setData({ saving: true });
    wx.showLoading({ title: '保存中...' });
    let successCount = 0;
    for (const url of this.data.task.results) {
      try {
        const res = await wx.cloud.downloadFile({ fileID: url });
        await wx.saveImageToPhotosAlbum({ filePath: res.tempFilePath });
        successCount++;
      } catch (e) {}
    }
    wx.hideLoading();
    wx.showToast({ title: `已保存${successCount}张`, icon: successCount > 0 ? 'success' : 'none' });
    this.setData({ saving: false });
  },

  retryWithSame() {
    if (!this.data.task) return;
    wx.setStorageSync('createParams', { templateId: this.data.task.templateId });
    wx.switchTab({ url: '/pages/create/create' });
  },

  chooseNewTemplate() {
    wx.switchTab({ url: '/pages/create/create' });
  },

  onRecommendTap(e) {
    wx.setStorageSync('createParams', { templateId: e.currentTarget.dataset.id });
    wx.switchTab({ url: '/pages/create/create' });
  },

  async loadRecommend() {
    try {
      const res = await wx.cloud.callFunction({ name: 'templates', data: { action: 'recommend', pageSize: 4 } });
      this.setData({ recommendTemplates: res.result?.data || [] });
    } catch (e) {
      this.setData({
        recommendTemplates: [
          { id: '1', name: '韩系证件照', cover: '/images/demo/template1.jpg' },
          { id: '2', name: '法式油画', cover: '/images/demo/template2.jpg' },
          { id: '4', name: '赛博朋克', cover: '/images/demo/template4.jpg' },
          { id: '7', name: '迪士尼公主', cover: '/images/demo/template7.jpg' },
        ],
      });
    }
  },

  goBack() {
    wx.navigateBack({ delta: 1 });
  },

  onShareAppMessage() {
    return { title: '看看我的AI写真，太绝了！', path: `/subpkg/result/result?taskId=${this.data.taskId}` };
  },
});
