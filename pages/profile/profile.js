// pages/profile/profile.js
const app = getApp();
const { timeAgo } = require('../../utils/util.js');

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

  // 登录 — 使用新的头像昵称填写组件方式
  async onLogin() {
    try {
      // 先尝试获取用户信息（兼容旧版）
      if (wx.getUserProfile) {
        try {
          const profile = await new Promise((resolve, reject) => {
            wx.getUserProfile({
              desc: '用于完善用户资料',
              success: resolve,
              fail: reject,
            });
          });
          const userInfo = profile.userInfo;
          app.globalData.userInfo = userInfo;
          this.setData({ userInfo });
          await wx.cloud.callFunction({ name: 'user', data: { action: 'updateProfile', userInfo } });
          return;
        } catch (_) {
          // getUserProfile 被拒绝或不可用，降级处理
        }
      }
      // 降级：提示用户使用头像昵称填写组件
      wx.showToast({ title: '请点击头像完善资料', icon: 'none' });
    } catch (e) {
      console.error('登录失败:', e);
    }
  },

  // 从头像昵称组件获取信息（配合 wxml 中的 button open-type）
  onChooseAvatar(e) {
    const avatarUrl = e.detail.avatarUrl;
    if (avatarUrl) {
      const userInfo = { ...this.data.userInfo, avatarUrl };
      app.globalData.userInfo = userInfo;
      this.setData({ userInfo });
      wx.cloud.callFunction({ name: 'user', data: { action: 'updateProfile', userInfo } }).catch(() => {});
    }
  },

  // 加载统计
  async loadStats() {
    try {
      const res = await wx.cloud.callFunction({ name: 'user', data: { action: 'stats' } });
      if (res.result && !res.result.error) {
        this.setData({
          stats: {
            works: res.result.works || 0,
            favorites: res.result.favorites || 0,
            likes: res.result.likes || 0,
            following: res.result.following || 0,
          },
        });
      }
    } catch (e) {
      // 网络异常显示零值，不显示假数据
      this.setData({ stats: { works: 0, favorites: 0, likes: 0, following: 0 } });
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
      const raw = res.result?.data || [];
      const items = raw.length > 0 ? raw.map(item => ({
        ...item,
        timeAgo: timeAgo(item.createdAt),
        cover: (item.results && item.results[0]) || `/images/demo/template${Math.floor(Math.random() * 12) + 1}.jpg`,
        imgHeight: [300, 380, 340, 420, 280, 360][Math.floor(Math.random() * 6)],
      })) : [];
      this.splitWorks(items);
    } catch (e) {
      this.splitWorks([]);
    }
    this.setData({ worksLoading: false });
  },

  splitWorks(items) {
    const left = [], right = [];
    items.forEach((item, i) => { (i % 2 === 0 ? left : right).push(item); });
    this.setData({ myWorksLeft: left, myWorksRight: right });
  },

  switchWorksTab(e) {
    this.setData({ worksTab: e.currentTarget.dataset.tab });
    this.loadMyWorks();
  },

  viewResult(e) {
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({ url: `/subpkg/result/result?taskId=${id}` });
  },

  goCreate() {
    wx.switchTab({ url: '/pages/create/create' });
  },

  seeMyWorks() {},

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
      help: () => wx.showModal({ title: '帮助', content: '常见问题请访问帮助中心', showCancel: false }),
      settings: () => this.goSettings(),
    };
    (actions[type] || (() => {}))();
  },
});
