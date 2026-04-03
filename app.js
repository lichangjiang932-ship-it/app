// app.js
App({
  onLaunch() {
    if (!wx.cloud) {
      console.error('请使用 2.2.3 或以上的基础库以使用云能力');
    } else {
      wx.cloud.init({
        env: 'your-env-id', // 替换为你的云开发环境ID
        traceUser: true,
      });
    }

    this.globalData = {
      userInfo: null,
      openid: null,
    };

    // 获取用户openid
    this.getOpenid();
  },

  async getOpenid() {
    try {
      const res = await wx.cloud.callFunction({ name: 'user', data: { action: 'getOpenid' } });
      this.globalData.openid = res.result.openid;
    } catch (e) {
      console.error('获取openid失败', e);
    }
  },

  globalData: {
    userInfo: null,
    openid: null,
  },
});
