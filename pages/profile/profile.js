// pages/profile/profile.js
const app = getApp();

Page({
  data: {
    statusBarHeight: 0,
    navBarHeight: 44,
    userInfo: null,
    openid: '',
    stats: { works: 0, favorites: 0, likes: 0, following: 0 },
    worksTab: 'all',
    worksLoading: true,
    myWorksLeft: [],
    myWorksRight: [],
    menuItems: [
      { type: 'photos', icon: '🖼️', name: '我的照片', badge: '' },
      { type: 'orders', icon: '📋', name: '我的订单', badge: '' },
      { type: 'vip', icon: '👑', name: '会员中心', badge: '', vip: true },
      { type: 'invite', icon: '🎁', name: '邀请好友', badge: '得VIP' },
      { type: 'feedback', icon: '💬', name: '联系客服', badge: '' },
      { type: 'help', icon: '❓', name: '帮助中心', badge: '' },
      { type: 'settings', icon: '⚙️', name: '设置', badge: '' },
    ],
  },

  onShow() {
    const sys = wx.getSystemInfoSync();
    this.setData({
      statusBarHeight: sys.statusBarHeight,
      userInfo: app.globalData.userInfo,
      openid: app.globalData.openid || '',
    });
    this.loadStats();
    this.loadMyWorks();
  },

  // 登录
  async onLogin() {
    try {
      const profile = await wx.getUserProfile({ desc: '用于完善用户资料' });
      const userInfo = profile.userInfo;
      app.globalData.userInfo = userInfo;
      this.setData({ userInfo });
      await wx.cloud.callFunction({ name: 'user', data: { action: 'updateProfile', userInfo } });
    } catch (e) {}
  },

  // 加载统计
  async loadStats() {
    try {
      const res = await wx.cloud.callFunction({ name: 'user', data: { action: 'stats' } });
      if (res.result) this.setData({ stats: res.result });
    } catch (e) {
      this.setData({ stats: { works: 8, favorites: 12, likes: 156, following: 5 } });
    }
  },

  // 加载我的作品
  async loadMyWorks() {
    this.setData({ worksLoading: true });
    try {
      const res = await wx.cloud.callFunction({
        name: 'tasks',
        data: { action: 'myList', page: 1, pageSize: 20 },
      });
      const items = (res.result?.data || this.getDefaultWorks()).map(item => ({
        ...item,
        timeAgo: this.timeAgo(item.createdAt || Date.now()),
        cover: (item.results && item.results[0]) || `/images/demo/template${Math.floor(Math.random()*12)+1}.jpg`,
        imgHeight: [300, 380, 340, 420, 280, 360][Math.floor(Math.random() * 6)],
      }));
      this.splitWorks(items);
    } catch (e) {
      const items = this.getDefaultWorks().map(item => ({
        ...item,
        imgHeight: [300, 380, 340, 420, 280, 360][Math.floor(Math.random() * 6)],
      }));
      this.splitWorks(items);
    }
    this.setData({ worksLoading: false });
  },

  splitWorks(items) {
    const left = [], right = [];
    items.forEach((item, i) => { (i % 2 === 0 ? left : right).push(item); });
    this.setData({ myWorksLeft: left, myWorksRight: right });
  },

  getDefaultWorks() {
    return [
      { id: '1', templateName: '法式油画写真', status: 'completed', timeAgo: '2小时前', cover: '/images/demo/template2.jpg' },
      { id: '2', templateName: '韩系证件照', status: 'completed', timeAgo: '1天前', cover: '/images/demo/template1.jpg' },
      { id: '3', templateName: '赛博朋克风', status: 'processing', timeAgo: '生成中', cover: '/images/demo/template4.jpg' },
      { id: '4', templateName: '古风汉服', status: 'completed', timeAgo: '3天前', cover: '/images/demo/template9.jpg' },
      { id: '5', templateName: '迪士尼公主', status: 'completed', timeAgo: '5天前', cover: '/images/demo/template7.jpg' },
      { id: '6', templateName: '港风复古', status: 'completed', timeAgo: '1周前', cover: '/images/demo/template5.jpg' },
    ];
  },

  switchWorksTab(e) {
    this.setData({ worksTab: e.currentTarget.dataset.tab });
    // 实际应该重新请求过滤数据
    this.loadMyWorks();
  },

  viewResult(e) {
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({ url: `/subpkg/result/result?taskId=${id}` });
  },

  goCreate() {
    wx.switchTab({ url: '/pages/create/create' });
  },

  seeMyWorks() {
    // 滚动到作品区或查看全部
  },

  goVip() {
    wx.showModal({ title: 'VIP会员', content: '无限生成 · 高清导出 · 专属模板', confirmText: '立即开通', cancelText: '稍后', success: (r) => { if (r.confirm) wx.showToast({ title: '支付功能开发中', icon: 'none' }); } });
  },

  goSettings() {
    wx.showToast({ title: '设置页开发中', icon: 'none' });
  },

  onMenuTap(e) {
    const type = e.currentTarget.dataset.type;
    const actions = {
      photos: () => wx.showToast({ title: '照片管理开发中', icon: 'none' }),
      orders: () => wx.showToast({ title: '订单功能开发中', icon: 'none' }),
      vip: () => this.goVip(),
      invite: () => wx.showToast({ title: '邀请功能开发中', icon: 'none' }),
      feedback: () => wx.makePhoneCall({ phoneNumber: '4000000000', fail: () => {} }),
      help: () => wx.showModal({ title: '帮助', content: '常见问题请访问 help.miaoya.cn', showCancel: false }),
      settings: () => this.goSettings(),
    };
    (actions[type] || (() => {}))();
  },

  timeAgo(ts) {
    if (!ts) return '';
    const diff = Date.now() - ts;
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return '刚刚';
    if (mins < 60) return `${mins}分钟前`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}小时前`;
    const days = Math.floor(hrs / 24);
    if (days < 30) return `${days}天前`;
    return `${Math.floor(days / 30)}个月前`;
  },
});
