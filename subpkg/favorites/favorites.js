// subpkg/favorites/favorites.js
const { safeGet, safeSet } = require('../../utils/cloud.js');
const notify = require('../../utils/notify.js');

Page({
  data: {
    statusBarHeight: 0,
    favorites: [],
    loading: true,
  },

  onLoad() {
    const sys = wx.getSystemInfoSync();
    this.setData({ statusBarHeight: sys.statusBarHeight });
    this.loadFavorites();
  },

  onShow() {
    this.loadFavorites();
  },

  loadFavorites() {
    this.setData({ loading: true });
    const favMap = safeGet('favorites') || {};
    const favIds = Object.keys(favMap).filter(k => favMap[k]);
    // 从模板数据中匹配收藏的模板
    // 这里简化处理：直接从本地存储的收藏详情读取
    const favDetails = safeGet('favoriteDetails') || {};
    const favorites = favIds.map(id => favDetails[id] || { id, name: '未知模板', cover: '/images/demo/template1.jpg' });
    this.setData({ favorites, loading: false });
  },

  goBack() {
    wx.navigateBack({ delta: 1 });
  },

  goDiscover() {
    wx.switchTab({ url: '/pages/index/index' });
  },

  onPreview(e) {
    const idx = e.currentTarget.dataset.index;
    const urls = this.data.favorites.map(f => f.cover);
    if (urls.length) {
      wx.previewImage({ current: urls[idx], urls });
    }
  },

  onTap(e) {
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({ url: `/subpkg/detail/detail?id=${id}` });
  },

  onRemove(e) {
    const id = e.currentTarget.dataset.id;
    notify.confirm({
      title: '取消收藏',
      content: '确定取消收藏吗？',
    }).then(res => {
      if (res.confirm) {
        const favMap = safeGet('favorites') || {};
        delete favMap[id];
        safeSet('favorites', favMap);
        this.loadFavorites();
        notify.success('已取消收藏');
      }
    });
  },
});
