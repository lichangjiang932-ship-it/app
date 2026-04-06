// pages/create/create.js
const { debounce } = require('../../utils/util.js');

Page({
  data: {
    statusBarHeight: 0,
    navBarHeight: 44,
    currentStep: 1,
    stepTitles: ['上传照片', '选择模板', '生成写真'],
    frontPhoto: '',
    multiPhotos: [],
    canNext: false,
    isGenerating: false, // 防重复提交
    // 模板
    currentTplCategory: 'all',
    tplCategories: [
      { id: 'all', name: '全部', emoji: '🌈' },
      { id: 'photo', name: '写真', emoji: '📸' },
      { id: 'avatar', name: '头像', emoji: '🎨' },
      { id: 'idphoto', name: '证件照', emoji: '🪪' },
      { id: 'art', name: '艺术', emoji: '🖼️' },
      { id: 'vintage', name: '复古', emoji: '📼' },
      { id: 'cartoon', name: '卡通', emoji: '🦄' },
    ],
    allTemplates: [],
    leftTemplates: [],
    rightTemplates: [],
    selectedTemplate: '',
    // 生成
    genStatus: { title: '正在上传照片', desc: '准备中...', progress: 0 },
    taskId: '',
    // 订阅消息模板ID（在微信后台获取后填入）
    subscribeTmplId: '',
  },

  onLoad() {
    const sys = wx.getSystemInfoSync();
    this.setData({ statusBarHeight: sys.statusBarHeight });
    this.loadTemplates();
  },

  onShow() {
    const params = wx.getStorageSync('createParams');
    if (params) {
      wx.removeStorageSync('createParams');
      if (params.templateId) {
        this.setData({ selectedTemplate: params.templateId, currentStep: 2 });
      }
      if (params.type) {
        const cat = params.type === 'photo' ? 'photo' : params.type === 'avatar' ? 'cartoon' : params.type;
        this.setData({ currentTplCategory: cat });
        this.filterTemplates(cat);
      }
    }
  },

  // 压缩图片
  compressImage(tempPath) {
    return new Promise((resolve) => {
      wx.compressImage({
        src: tempPath,
        quality: 80,
        success: (res) => resolve(res.tempFilePath),
        fail: () => resolve(tempPath), // 压缩失败用原图
      });
    });
  },

  // 上传
  chooseFrontPhoto() {
    wx.chooseMedia({
      count: 1, mediaType: ['image'], sourceType: ['album', 'camera'], sizeType: ['compressed'],
      success: async (res) => {
        const path = await this.compressImage(res.tempFiles[0].tempFilePath);
        this.setData({ frontPhoto: path });
        this.checkCanNext();
      },
    });
  },

  chooseFromAlbum() {
    const remain = 30 - this.data.multiPhotos.length;
    if (remain <= 0) return wx.showToast({ title: '最多上传30张', icon: 'none' });
    wx.chooseMedia({
      count: Math.min(remain, 9), mediaType: ['image'], sourceType: ['album'], sizeType: ['compressed'],
      success: async (res) => {
        const paths = await Promise.all(res.tempFiles.map(f => this.compressImage(f.tempFilePath)));
        const photos = [...this.data.multiPhotos, ...paths].slice(0, 30);
        this.setData({ multiPhotos: photos });
        this.checkCanNext();
      },
    });
  },

  chooseFromCamera() {
    wx.chooseMedia({
      count: 1, mediaType: ['image'], sourceType: ['camera'], sizeType: ['compressed'],
      success: async (res) => {
        const path = await this.compressImage(res.tempFiles[0].tempFilePath);
        const photos = [...this.data.multiPhotos, path].slice(0, 30);
        this.setData({ multiPhotos: photos });
        this.checkCanNext();
      },
    });
  },

  deleteFrontPhoto() {
    this.setData({ frontPhoto: '' });
    this.checkCanNext();
  },

  chooseMultiPhotos() {
    const remain = 30 - this.data.multiPhotos.length;
    if (remain <= 0) return wx.showToast({ title: '最多上传30张', icon: 'none' });
    wx.chooseMedia({
      count: Math.min(remain, 9), mediaType: ['image'], sourceType: ['album', 'camera'], sizeType: ['compressed'],
      success: async (res) => {
        const paths = await Promise.all(res.tempFiles.map(f => this.compressImage(f.tempFilePath)));
        const photos = [...this.data.multiPhotos, ...paths].slice(0, 30);
        this.setData({ multiPhotos: photos });
        this.checkCanNext();
      },
    });
  },

  deleteMultiPhoto(e) {
    const idx = e.currentTarget.dataset.index;
    const photos = [...this.data.multiPhotos];
    photos.splice(idx, 1);
    this.setData({ multiPhotos: photos });
    this.checkCanNext();
  },

  checkCanNext() {
    this.setData({ canNext: !!(this.data.frontPhoto && this.data.multiPhotos.length >= 5) });
  },

  goNext() {
    if (this.data.currentStep === 1) {
      if (!this.data.canNext) return wx.showToast({ title: '请上传1张正面照+至少5张生活照', icon: 'none' });
      this.setData({ currentStep: 2 });
    } else if (this.data.currentStep === 2) {
      if (!this.data.selectedTemplate) return wx.showToast({ title: '请选择一个模板', icon: 'none' });
      this.startGenerate();
    }
  },

  goBack() {
    if (this.data.currentStep > 1) this.setData({ currentStep: this.data.currentStep - 1 });
  },

  showTip() {
    wx.showModal({ title: '拍摄技巧', content: '1. 选择光线充足的环境\n2. 正面面对镜头，表情自然\n3. 照片中只有你一个人\n4. 不同角度/表情各拍几张\n5. 避免模糊或过度美颜的照片', showCancel: false });
  },

  // 模板
  switchTplCategory(e) {
    const id = e.currentTarget.dataset.id;
    this.setData({ currentTplCategory: id });
    this.filterTemplates(id);
  },

  filterTemplates(cat) {
    const all = this.data.allTemplates;
    const filtered = cat === 'all' ? all : (cat === 'hot' ? all.filter(t => t.isHot) : all.filter(t => t.category === cat));
    this.splitTemplates(filtered);
  },

  splitTemplates(items) {
    const left = [], right = [];
    items.forEach((item, i) => { (i % 2 === 0 ? left : right).push(item); });
    this.setData({ leftTemplates: left, rightTemplates: right });
  },

  selectTemplate(e) {
    this.setData({ selectedTemplate: e.currentTarget.dataset.id });
  },

  async loadTemplates() {
    try {
      const res = await wx.cloud.callFunction({ name: 'templates', data: { action: 'list', category: 'all', page: 1, pageSize: 20 } });
      const tpls = res.result?.data || this.getDefaultTemplates();
      this.setData({ allTemplates: tpls });
      this.splitTemplates(tpls);
    } catch (e) {
      const tpls = this.getDefaultTemplates();
      this.setData({ allTemplates: tpls });
      this.splitTemplates(tpls);
    }
  },

  getDefaultTemplates() {
    return [
      { id: '1', name: '韩系证件照', cover: '/images/demo/template1.jpg', category: 'idphoto', useCount: 128000, isNew: false },
      { id: '2', name: '法式油画', cover: '/images/demo/template2.jpg', category: 'photo', useCount: 96000, isNew: true },
      { id: '3', name: '日系清新', cover: '/images/demo/template3.jpg', category: 'photo', useCount: 85000, isNew: false },
      { id: '4', name: '赛博朋克', cover: '/images/demo/template4.jpg', category: 'art', useCount: 72000, isNew: true },
      { id: '5', name: '港风复古', cover: '/images/demo/template5.jpg', category: 'vintage', useCount: 68000, isNew: false },
      { id: '6', name: '校园青春', cover: '/images/demo/template6.jpg', category: 'photo', useCount: 65000, isNew: false },
      { id: '7', name: '迪士尼公主', cover: '/images/demo/template7.jpg', category: 'cartoon', useCount: 110000, isNew: true },
      { id: '8', name: '商务精英', cover: '/images/demo/template8.jpg', category: 'idphoto', useCount: 54000, isNew: false },
      { id: '9', name: '古风汉服', cover: '/images/demo/template9.jpg', category: 'art', useCount: 92000, isNew: false },
      { id: '10', name: '情侣甜蜜', cover: '/images/demo/template10.jpg', category: 'photo', useCount: 48000, isNew: true },
      { id: '11', name: '油画肖像', cover: '/images/demo/template11.jpg', category: 'art', useCount: 58000, isNew: false },
      { id: '12', name: '动漫头像', cover: '/images/demo/template12.jpg', category: 'cartoon', useCount: 76000, isNew: false },
    ];
  },

  // 生成
  async startGenerate() {
    if (this.data.isGenerating) return;
    this.setData({ isGenerating: true, currentStep: 3 });
    this.updateGen('正在上传照片', '压缩并上传中...', 10);

    const photoUrls = await this.uploadAllPhotos();
    if (!photoUrls) {
      this.setData({ isGenerating: false });
      return;
    }

    this.updateGen('创建生成任务', '提交中...', 30);
    const taskId = await this.createTask(photoUrls);
    if (!taskId) {
      this.setData({ isGenerating: false });
      return;
    }

    this.setData({ taskId });
    this.pollResult(taskId);
  },

  async uploadAllPhotos() {
    try {
      const all = [this.data.frontPhoto, ...this.data.multiPhotos];
      const ids = await Promise.all(all.map((path, i) => {
        const ext = path.split('.').pop() || 'jpg';
        return wx.cloud.uploadFile({
          cloudPath: `user-photos/${Date.now()}_${i}.${ext}`,
          filePath: path,
        }).then(r => r.fileID);
      }));
      return ids;
    } catch (e) {
      wx.showToast({ title: '上传失败，请重试', icon: 'none' });
      this.setData({ currentStep: 1 });
      return null;
    }
  },

  async createTask(photos) {
    try {
      const res = await wx.cloud.callFunction({
        name: 'tasks',
        data: { action: 'create', photos, templateId: this.data.selectedTemplate },
      });
      if (res.result?.error) {
        wx.showToast({ title: res.result.error, icon: 'none' });
        this.setData({ currentStep: 2 });
        return null;
      }
      return res.result.taskId;
    } catch (e) {
      wx.showToast({ title: '创建失败，请重试', icon: 'none' });
      this.setData({ currentStep: 2 });
      return null;
    }
  },

  pollResult(taskId) {
    let progress = 30;
    let pollCount = 0;
    let failCount = 0;
    const maxPolls = 60; // 最多轮询3分钟
    const maxFails = 5; // 连续失败5次则提示

    const timer = setInterval(async () => {
      pollCount++;
      if (pollCount > maxPolls) {
        clearInterval(timer);
        this.setData({ isGenerating: false });
        wx.showModal({
          title: '处理中',
          content: '生成时间较长，请稍后在"我的"查看结果',
          showCancel: false,
          success: () => wx.switchTab({ url: '/pages/profile/profile' }),
        });
        return;
      }

      try {
        const res = await wx.cloud.callFunction({
          name: 'tasks',
          data: { action: 'status', taskId },
        });
        failCount = 0; // 成功则重置
        const task = res.result;
        if (task.status === 'processing') {
          progress = Math.max(progress, task.progress || 0);
          progress = Math.min(progress + 3, 90);
          this.updateGen('AI正在生成中', `已完成 ${Math.round(progress)}%...`, Math.round(progress));
        } else if (task.status === 'completed') {
          clearInterval(timer);
          this.setData({ isGenerating: false });
          this.updateGen('生成完成！', '跳转中...', 100);
          setTimeout(() => wx.redirectTo({ url: `/subpkg/result/result?taskId=${taskId}` }), 800);
        } else if (task.status === 'failed') {
          clearInterval(timer);
          this.setData({ isGenerating: false });
          wx.showModal({
            title: '生成失败',
            content: task.errorMsg || '请重试',
            showCancel: false,
            success: () => this.setData({ currentStep: 2 }),
          });
        }
      } catch (e) {
        failCount++;
        console.error(`轮询失败 (${failCount}/${maxFails}):`, e);
        if (failCount >= maxFails) {
          clearInterval(timer);
          this.setData({ isGenerating: false });
          wx.showModal({
            title: '网络异常',
            content: '无法获取生成状态，请检查网络后在"我的"查看结果',
            showCancel: false,
            success: () => wx.switchTab({ url: '/pages/profile/profile' }),
          });
        }
      }
    }, 3000);
  },

  updateGen(title, desc, progress) {
    this.setData({ genStatus: { title, desc, progress } });
  },

  // 订阅消息通知
  subscribeMsg() {
    const tmplId = this.data.subscribeTmplId;
    if (!tmplId) {
      wx.showToast({ title: '通知功能暂未配置', icon: 'none' });
      return;
    }
    wx.requestSubscribeMessage({
      tmplIds: [tmplId],
      success: (res) => {
        if (res[tmplId] === 'accept') {
          wx.showToast({ title: '已订阅，完成后通知你', icon: 'success' });
        }
      },
      fail: () => {
        wx.showToast({ title: '订阅功能需要授权', icon: 'none' });
      },
    });
  },
});
