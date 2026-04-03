// pages/index/index.js
const db = wx.cloud.database();
const PAGE_SIZE = 10;

// 本地缓存键
const CACHE_KEY_TEMPLATES = 'cache_templates';
const CACHE_EXPIRE = 24 * 60 * 60 * 1000; // 1天

Page({
  data: {
    // 用户
    userInfo: null,
    msgCount: 3,

    // 骨架屏
    loading: true,
    skeletonSections: { banner: true, tools: true, hscroll: true, waterfall: true },

    // Banner
    bannerIndex: 0,
    banners: [
      { id: 1, tag: '✨ 限时活动', title: 'AI梦幻写真', desc: '新用户免费体验3次', color1: '#FF6B9D', color2: '#C44FE2', emoji: '📸', type: 'photo' },
      { id: 2, tag: '🔥 爆款上线', title: '百变头像', desc: '30+风格任你选', color1: '#6C5CE7', color2: '#a29bfe', emoji: '🎨', type: 'avatar' },
      { id: 3, tag: '🪪 实用工具', title: '智能证件照', desc: '一键换底换装', color1: '#00b894', color2: '#55efc4', emoji: '🪪', type: 'idphoto' },
    ],

    // 金刚区 — 4列
    coreTools: [
      { id: 'photo', name: 'AI写真', desc: '大片质感', emoji: '📸', bg: 'linear-gradient(135deg, #FF6B9D, #FF8E53)', hot: true },
      { id: 'avatar', name: '百变头像', desc: '个性十足', emoji: '🎨', bg: 'linear-gradient(135deg, #6C5CE7, #a29bfe)', hot: false },
      { id: 'idphoto', name: '证件照', desc: '专业合规', emoji: '🪪', bg: 'linear-gradient(135deg, #00b894, #55efc4)', hot: false },
      { id: 'restore', name: '照片修复', desc: '老片翻新', emoji: '🔧', bg: 'linear-gradient(135deg, #fdcb6e, #e17055)', hot: true },
    ],

    // 热门推荐
    hotTemplates: [],

    // 分类
    currentCategory: 'hot',
    categoryFixed: false,
    categoryBarTop: 0,
    categories: [
      { id: 'hot', name: '热门', emoji: '🔥' },
      { id: 'new', name: '最新', emoji: '✨' },
      { id: 'female', name: '女生', emoji: '👧' },
      { id: 'male', name: '男生', emoji: '👦' },
      { id: 'couple', name: '情侣', emoji: '💑' },
      { id: 'art', name: '艺术', emoji: '🎨' },
      { id: 'vintage', name: '复古', emoji: '📼' },
      { id: 'cartoon', name: '卡通', emoji: '🦄' },
    ],

    // 瀑布流
    allItems: [],
    leftItems: [],
    rightItems: [],
    leftHeight: 0,
    rightHeight: 0,

    // 分页 & 滚动
    page: 1,
    isLoadingMore: false,
    noMore: false,
    refresherTriggered: false,
  },

  onLoad() {
    this.setData({
      userInfo: getApp().globalData.userInfo,
    });
    this.initData();
  },

  onShow() {
    this.setData({ userInfo: getApp().globalData.userInfo });
  },

  // 吸顶检测
  onPageScroll(e) {
    if (!this.data.categoryBarTop) return;
    const sys = wx.getSystemInfoSync();
    const navHeight = sys.statusBarHeight + 44;
    const fixed = e.scrollTop + navHeight >= this.data.categoryBarTop;
    if (fixed !== this.data.categoryFixed) {
      this.setData({ categoryFixed: fixed });
    }
  },

  // ===== 初始化 =====
  async initData() {
    this.setData({ loading: true });
    await Promise.all([
      this.loadHotTemplates(),
      this.loadWaterfall(1),
    ]);
    // 获取分类栏位置
    setTimeout(() => {
      wx.createSelectorQuery().select('#categoryBar').boundingClientRect(rect => {
        if (rect) this.setData({ categoryBarTop: rect.top });
      }).exec();
    }, 500);
    this.setData({ loading: false });
  },

  // ===== 下拉刷新 =====
  onRefresh() {
    this.setData({ refresherTriggered: true });
    this.setData({
      page: 1, noMore: false,
      allItems: [], leftItems: [], rightItems: [],
      leftHeight: 0, rightHeight: 0,
    });
    Promise.all([this.loadHotTemplates(), this.loadWaterfall(1)]).then(() => {
      this.setData({ refresherTriggered: false });
    });
  },

  // ===== 上拉预加载（提前200px触发） =====
  onLoadMore() {
    if (!this.data.isLoadingMore && !this.data.noMore) {
      this.loadMore();
    }
  },

  // ===== 加载热门推荐 =====
  async loadHotTemplates() {
    // 尝试本地缓存
    try {
      const cache = wx.getStorageSync(CACHE_KEY_TEMPLATES);
      if (cache && cache.data && (Date.now() - cache.time < CACHE_EXPIRE)) {
        this.setData({ hotTemplates: cache.data.slice(0, 6) });
        return;
      }
    } catch (e) {}

    try {
      const res = await wx.cloud.callFunction({
        name: 'templates',
        data: { action: 'list', category: 'hot', page: 1, pageSize: 6 },
      });
      const data = res.result?.data || this.getDefaultHot();
      this.setData({ hotTemplates: data });
      // 写入缓存
      wx.setStorageSync(CACHE_KEY_TEMPLATES, { data, time: Date.now() });
    } catch (e) {
      this.setData({ hotTemplates: this.getDefaultHot() });
    }
  },

  // ===== 瀑布流加载 =====
  async loadWaterfall(page) {
    if (page === 1) {
      this.setData({ leftHeight: 0, rightHeight: 0 });
    }
    try {
      const res = await wx.cloud.callFunction({
        name: 'templates',
        data: { action: 'works', category: this.data.currentCategory, page, pageSize: PAGE_SIZE },
      });
      const items = (res.result?.data || this.getDefaultWorks()).map(item => ({
        ...item,
        imgHeight: item.imgHeight || (300 + Math.floor(Math.random() * 150)),
      }));
      this.appendWaterfallItems(items, page);
      if (items.length < PAGE_SIZE) this.setData({ noMore: true });
    } catch (e) {
      const items = this.getDefaultWorks().map(item => ({
        ...item,
        imgHeight: item.imgHeight || (300 + Math.floor(Math.random() * 150)),
      }));
      this.appendWaterfallItems(items, page);
    }
  },

  // 核心算法：分配到更矮的列
  appendWaterfallItems(items, page) {
    const left = page === 1 ? [] : [...this.data.leftItems];
    const right = page === 1 ? [] : [...this.data.rightItems];
    let lh = this.data.leftHeight;
    let rh = this.data.rightHeight;

    items.forEach(item => {
      if (lh <= rh) {
        left.push(item);
        lh += item.imgHeight + 100; // 图片高度 + 信息区
      } else {
        right.push(item);
        rh += item.imgHeight + 100;
      }
    });

    // setData 优化：一次性 concat
    this.setData({
      leftItems: left,
      rightItems: right,
      leftHeight: lh,
      rightHeight: rh,
      allItems: [...this.data.allItems, ...items],
    });
  },

  async loadMore() {
    this.setData({ isLoadingMore: true });
    const next = this.data.page + 1;
    await this.loadWaterfall(next);
    this.setData({ page: next, isLoadingMore: false });
  },

  // ===== 分类切换 =====
  switchCategory(e) {
    const id = e.currentTarget.dataset.id;
    if (id === this.data.currentCategory) return;
    // 震动反馈
    wx.vibrateShort && wx.vibrateShort({ type: 'light' });
    this.setData({
      currentCategory: id,
      page: 1, noMore: false,
      allItems: [], leftItems: [], rightItems: [],
      leftHeight: 0, rightHeight: 0,
    });
    this.loadWaterfall(1);
  },

  // ===== 交互事件 =====
  onBannerChange(e) {
    this.setData({ bannerIndex: e.detail.current });
  },

  onBannerTap(e) {
    wx.vibrateShort && wx.vibrateShort({ type: 'light' });
    const item = e.currentTarget.dataset.item;
    wx.setStorageSync('createParams', { type: item.type });
    wx.switchTab({ url: '/pages/create/create' });
  },

  onToolTap(e) {
    wx.vibrateShort && wx.vibrateShort({ type: 'light' });
    const item = e.currentTarget.dataset.item;
    wx.setStorageSync('createParams', { type: item.id });
    wx.switchTab({ url: '/pages/create/create' });
  },

  seeAllTemplates() {
    wx.switchTab({ url: '/pages/create/create' });
  },

  onTemplateTap(e) {
    wx.navigateTo({ url: `/subpkg/detail/detail?id=${e.currentTarget.dataset.id}` });
  },

  onWorkTap(e) {
    wx.navigateTo({ url: `/subpkg/detail/detail?id=${e.currentTarget.dataset.id}` });
  },

  // 点赞
  onLike(e) {
    wx.vibrateShort && wx.vibrateShort({ type: 'light' });
    const id = e.currentTarget.dataset.id;
    const liked = e.currentTarget.dataset.liked;
    const update = items => items.map(i =>
      i.id === id ? { ...i, liked: !liked, likeCount: (i.likeCount || 0) + (liked ? -1 : 1) } : i
    );
    this.setData({
      leftItems: update(this.data.leftItems),
      rightItems: update(this.data.rightItems),
    });
  },

  // 图片加载失败占位
  onImgError(e) {
    // 设置默认占位图
    const id = e.currentTarget.dataset.id;
    // 注意：小程序中无法动态替换 image src，这里记录错误状态
    console.warn('图片加载失败:', id);
  },

  // 搜索 / 消息 / 个人
  onSearch() { wx.showToast({ title: '搜索功能开发中', icon: 'none' }); },
  onMessage() { wx.showToast({ title: '消息中心开发中', icon: 'none' }); },
  goProfile() { wx.switchTab({ url: '/pages/profile/profile' }); },

  // ===== 默认数据 =====
  getDefaultHot() {
    return Array.from({ length: 6 }, (_, i) => ({
      id: `hot${i + 1}`,
      name: ['韩系证件照', '法式油画', '赛博朋克', '古风汉服', '迪士尼公主', '港风复古'][i],
      cover: `/images/demo/template${i + 1}.jpg`,
      useCount: [128, 96, 72, 92, 110, 68][i] * 1000,
      isNew: i % 3 === 0,
      style: ['证件照', '写真', '艺术', '艺术', '卡通', '复古'][i],
    }));
  },

  getDefaultWorks() {
    const names = ['韩系证件照', '法式油画写真', '日系清新风', '赛博朋克', '港风复古', '校园青春', '迪士尼公主', '商务精英', '古风汉服', '情侣甜蜜照', '油画肖像', '动漫头像'];
    const styles = ['证件照', '写真', '写真', '艺术', '复古', '写真', '卡通', '证件照', '艺术', '写真', '艺术', '卡通'];
    const heights = [340, 420, 360, 450, 320, 400, 380, 440, 350, 410, 370, 430];
    return Array.from({ length: 12 }, (_, i) => ({
      id: `work${i + 1}`,
      name: names[i],
      cover: `/images/demo/template${(i % 12) + 1}.jpg`,
      style: styles[i],
      authorName: ['小雅', '阿明', '月月', '大壮', '甜甜', '小新', '默默', '乐乐', '清风', '明月', '星辰', '大海'][i],
      authorAvatar: '/images/default-avatar.png',
      likeCount: Math.floor(Math.random() * 500 + 50),
      liked: false,
      useCount: Math.floor(Math.random() * 10000 + 1000),
      imgHeight: heights[i],
    }));
  },

  onShareAppMessage() {
    return {
      title: '妙鸭 - AI写真，一键生成你的专属大片',
      path: '/pages/index/index',
    };
  },
});
