// subpkg/settings/settings.js
const { safeGet, safeSet, safeRemove } = require('../../utils/cloud.js');
const notify = require('../../utils/notify.js');
const app = getApp();

Page({
  data: {
    statusBarHeight: 0,
    navBarHeight: 44,
    userInfo: null,
    userId: '',
    // 开关状态
    notifyEnabled: true,
    autoSave: true,
  },

  onLoad() {
    const sys = wx.getSystemInfoSync();
    this.setData({ statusBarHeight: sys.statusBarHeight });
    this.loadUserInfo();
  },

  onShow() {
    this.loadUserInfo();
  },

  loadUserInfo() {
    const userInfo = safeGet('userInfo') || app.globalData.userInfo;
    const notifyEnabled = safeGet('setting_notify') !== false;
    const autoSave = safeGet('setting_autoSave') !== false;
    this.setData({
      userInfo,
      userId: userInfo?.openid ? String(userInfo.openid).slice(-8) : '',
      notifyEnabled,
      autoSave,
    });
  },

  goBack() {
    wx.navigateBack({ delta: 1 });
  },

  // 编辑昵称
  onEditProfile() {
    wx.showModal({
      title: '修改昵称',
      editable: true,
      placeholderText: '请输入新昵称',
      success: async (res) => {
        if (res.confirm && res.content) {
          const userInfo = this.data.userInfo || {};
          userInfo.nickName = res.content;
          safeSet('userInfo', userInfo);
          app.globalData.userInfo = userInfo;
          this.setData({ userInfo });
          try {
            await wx.cloud.callFunction({ name: 'user', data: { action: 'updateProfile', userInfo } });
          } catch (e) {}
          notify.success('昵称已更新');
        }
      },
    });
  },

  // 更换头像
  onChangeAvatar() {
    wx.chooseMedia({
      count: 1,
      mediaType: ['image'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        const avatarUrl = res.tempFiles[0].tempFilePath;
        const userInfo = this.data.userInfo || {};
        userInfo.avatarUrl = avatarUrl;
        safeSet('userInfo', userInfo);
        app.globalData.userInfo = userInfo;
        this.setData({ userInfo });
        notify.success('头像已更新');
      },
    });
  },

  // 通知开关
  onToggleNotify(e) {
    const enabled = e.detail.value;
    safeSet('setting_notify', enabled);
    this.setData({ notifyEnabled: enabled });
  },

  // 自动保存开关
  onToggleAutoSave(e) {
    const enabled = e.detail.value;
    safeSet('setting_autoSave', enabled);
    this.setData({ autoSave: enabled });
  },

  // 清除缓存
  onClearCache() {
    notify.confirm({
      title: '清除缓存',
      content: '将清除本地缓存数据，不会影响已生成的作品',
    }).then(res => {
      if (res.confirm) {
        try {
          wx.clearStorageSync();
        } catch (e) {}
        notify.success('缓存已清除');
        this.loadUserInfo();
      }
    });
  },

  // 关于我们
  onAbout() {
    notify.confirm({
      title: '关于妙鸭',
      content: '妙鸭AI写真 · v1.0.0\n使用即梦AI引擎\n让每个人都能拥有专业级写真大片',
      showCancel: false,
    });
  },

  // 隐私政策
  onPrivacy() {
    notify.info('隐私政策页面开发中');
  },

  // 用户协议
  onAgreement() {
    notify.info('用户协议页面开发中');
  },

  // 退出登录
  onLogout() {
    notify.confirm({
      title: '退出登录',
      content: '确定要退出登录吗？',
    }).then(res => {
      if (res.confirm) {
        safeRemove('userInfo');
        safeRemove('token');
        app.globalData.userInfo = null;
        app.globalData.openid = null;
        notify.success('已退出登录');
        wx.navigateBack({ delta: 1 });
      }
    });
  },
});
