// subpkg/history/history.js
const notify = require('../../utils/notify.js');

Page({
  data: {
    statusBarHeight: 0,
    navBarHeight: 44,
    works: [],
    loading: true,
  },

  onLoad() {
    const sys = wx.getSystemInfoSync();
    this.setData({ statusBarHeight: sys.statusBarHeight });
    this.loadWorks();
  },

  onShow() {
    this.loadWorks();
  },

  async loadWorks() {
    this.setData({ loading: true });
    try {
      const res = await wx.cloud.callFunction({
        name: 'tasks',
        data: { action: 'myList', page: 1, pageSize: 50 },
      });
      const works = (res.result?.data || []).map(item => ({
        ...item,
        cover: (item.results && item.results[0]) || '/images/demo/template1.jpg',
        timeAgo: this.timeAgo(item.createdAt),
      }));
      this.setData({ works });
    } catch (e) {
      this.setData({ works: [] });
    }
    this.setData({ loading: false });
  },

  goBack() {
    wx.navigateBack({ delta: 1 });
  },

  goCreate() {
    wx.switchTab({ url: '/pages/create/create' });
  },

  onPreview(e) {
    const idx = e.currentTarget.dataset.index;
    const urls = this.data.works.filter(w => w.results?.length).map(w => w.results[0]);
    if (urls.length) {
      wx.previewImage({ current: urls[idx] || urls[0], urls });
    }
  },

  viewResult(e) {
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({ url: `/subpkg/result/result?taskId=${id}` });
  },

  onSave(e) {
    const item = e.currentTarget.dataset.item;
    if (!item.results?.length) return;
    wx.showLoading({ title: '保存中...' });
    wx.cloud.downloadFile({ fileID: item.results[0] })
      .then(res => wx.saveImageToPhotosAlbum({ filePath: res.tempFilePath }))
      .then(() => {
        wx.hideLoading();
        notify.success('已保存到相册');
      })
      .catch(e => {
        wx.hideLoading();
        notify.error('保存失败');
      });
  },

  timeAgo(ts) {
    if (!ts) return '';
    let diff;
    if (typeof ts === 'object' && ts.$date) {
      diff = Date.now() - new Date(ts.$date).getTime();
    } else if (typeof ts === 'string') {
      diff = Date.now() - new Date(ts).getTime();
    } else {
      diff = Date.now() - ts;
    }
    if (isNaN(diff) || diff < 0) return '';
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return '刚刚';
    if (mins < 60) return `${mins}分钟前`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}小时前`;
    return `${Math.floor(hrs / 24)}天前`;
  },

  onShareAppMessage() {
    return { title: '妙鸭 - 我的作品', path: '/pages/index/index' };
  },
});
