// components/nav-bar/nav-bar.js
Component({
  options: { addGlobalClass: true, multipleSlots: true },
  properties: {
    title: { type: String, value: '' },
    titleGradient: { type: Boolean, value: false },
    back: { type: Boolean, value: false },
    home: { type: Boolean, value: false },
    fixed: { type: Boolean, value: true },
    placeholder: { type: Boolean, value: true },
    bgColor: { type: String, value: 'rgba(255,255,255,0.92)' },
  },
  data: {
    statusBarHeight: 0,
    navBarHeight: 44,
    menuBtnRect: { width: 0, height: 0, top: 0 },
  },
  lifetimes: {
    attached() {
      const sys = wx.getSystemInfoSync();
      // 获取胶囊按钮位置，精确适配灵动岛/动态岛
      let menuRect = { width: 87, height: 32, top: 0 };
      try {
        menuRect = wx.getMenuButtonBoundingClientRect();
      } catch (e) {}
      // 计算导航栏高度：胶囊底部 - 状态栏高度 + 胶囊上下间距
      const navBarHeight = menuRect.height + (menuRect.top - sys.statusBarHeight) * 2;
      this.setData({
        statusBarHeight: sys.statusBarHeight,
        navBarHeight: navBarHeight || 44,
        menuBtnRect: menuRect,
      });
    },
  },
  methods: {
    onBack() {
      const pages = getCurrentPages();
      if (pages.length > 1) {
        wx.navigateBack({ delta: 1 });
      } else if (this.properties.home) {
        wx.switchTab({ url: '/pages/index/index' });
      }
    },
    onHome() {
      wx.switchTab({ url: '/pages/index/index' });
    },
  },
});
