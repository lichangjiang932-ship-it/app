# 🦆 妙鸭 - AI写真微信小程序

> 以「妙鸭相机」为模板复刻的AI写真小程序，使用微信云开发 + 即梦AI生图引擎

## 📱 功能特性

- ✅ **AI写真生成** — 上传照片，选择风格模板，AI一键生成写真大片
- ✅ **多风格模板** — 韩系证件照、法式油画、赛博朋克、古风汉服等12+风格
- ✅ **瀑布流首页** — 仿原版妙鸭的瀑布流模板浏览体验
- ✅ **分类筛选** — 热门/最新/女生/男生/艺术/复古/卡通等分类
- ✅ **结果预览** — 支持大图预览、缩略图切换、一键保存到相册
- ✅ **个人中心** — 历史记录、统计数据、会员体系
- ✅ **微信云开发** — 云函数 + 云数据库 + 云存储，无需自建服务器

## 🏗️ 项目结构

```
miaoya-miniapp/
├── app.js                    # 应用入口
├── app.json                  # 全局配置
├── app.wxss                  # 全局样式
├── project.config.json       # 项目配置
├── sitemap.json              # 站点地图
│
├── pages/
│   ├── index/                # 🏠 首页 - 模板瀑布流
│   ├── create/               # 📸 制作页 - 上传照片 + 选模板 + 生成
│   ├── result/               # 🎉 结果页 - 预览/保存/分享生成结果
│   ├── detail/               # 📋 详情页 - 模板详情/预览
│   └── profile/              # 👤 我的 - 历史/统计/设置
│
├── components/
│   ├── nav-bar/              # 自定义导航栏
│   ├── loading-ring/         # 加载动画组件
│   ├── photo-uploader/       # 照片上传组件
│   └── template-card/        # 模板卡片组件
│
├── cloudfunctions/
│   ├── user/                 # ☁️ 用户管理云函数
│   ├── templates/            # ☁️ 模板管理云函数
│   ├── tasks/                # ☁️ 任务管理云函数
│   └── jimeng/               # ☁️ 即梦AI生图云函数 ⭐
│
├── utils/
│   ├── util.js               # 工具函数
│   └── jimeng-config.js      # 即梦API配置
│
└── images/                   # 图片资源（需要自行添加）
    ├── demo/                 # 示例图片
    ├── tab-*.png             # TabBar图标
    └── default-avatar.png    # 默认头像
```

## 🚀 快速开始

### 1. 环境准备

1. 下载安装 [微信开发者工具](https://developers.weixin.qq.com/miniprogram/dev/devtools/download.html)
2. 注册微信小程序账号，获取 AppID
3. 开通 [微信云开发](https://developers.weixin.qq.com/miniprogram/dev/wxcloud/basis/getting-started.html)

### 2. 导入项目

1. 打开微信开发者工具
2. 选择「导入项目」
3. 选择本项目目录
4. 填入你的 AppID（`project.config.json` 中的 `appid` 字段）

### 3. 配置云开发

1. 在微信开发者工具中点击「云开发」
2. 创建云开发环境（如已有则跳过）
3. 获取环境ID（形如 `cloud1-xxxxx`）
4. 修改 `app.js` 中的环境ID：
   ```js
   wx.cloud.init({
     env: 'your-env-id', // ← 替换为你的环境ID
     traceUser: true,
   });
   ```

### 4. 创建云数据库集合

在云开发控制台 → 数据库中创建以下集合：

| 集合名    | 权限     | 说明         |
|----------|---------|-------------|
| `users`  | 仅创建者可读写 | 用户信息     |
| `templates` | 所有人可读 | 模板数据     |
| `tasks`  | 仅创建者可读写 | 生成任务     |

### 5. 配置即梦API

#### 方式一：环境变量（推荐）

在云开发控制台 → 设置 → 环境变量中添加：

| 变量名               | 值              |
|---------------------|-----------------|
| `JIMENG_API_KEY`    | 你的即梦API Key  |
| `JIMENG_API_SECRET` | 你的即梦API Secret |
| `JIMENG_API_URL`    | 即梦API地址      |

#### 方式二：直接修改代码

编辑 `cloudfunctions/jimeng/index.js` 中的 config 对象。

### 6. 部署云函数

1. 右键 `cloudfunctions/user` → 云端安装依赖 → 上传并部署
2. 右键 `cloudfunctions/templates` → 云端安装依赖 → 上传并部署
3. 右键 `cloudfunctions/tasks` → 云端安装依赖 → 上传并部署
4. 右键 `cloudfunctions/jimeng` → 云端安装依赖 → 上传并部署

### 7. 添加图片资源

在 `images/` 目录下添加：
- `demo/` — 模板示例图（template1.jpg ~ template12.jpg, result1.jpg ~ result4.jpg）
- TabBar 图标（tab-home.png, tab-home-active.png 等）
- `default-avatar.png` — 默认头像

### 8. 预览运行

点击微信开发者工具的「编译」即可预览。

## 🎨 UI设计说明

### 设计风格

- **主色调**：渐变粉色 `#FF6B9D → #C44FE2`
- **辅助色**：紫色 `#6C5CE7`、绿色 `#00b894`、橙色 `#fdcb6e`
- **字体**：系统字体栈（PingFang SC, Helvetica Neue...）
- **圆角**：统一 24rpx 大圆角
- **阴影**：轻量级 `0 4rpx 20rpx rgba(0,0,0,0.06)`
- **导航栏**：毛玻璃效果 `backdrop-filter: blur(20px)`

### 页面还原

| 页面   | 还原度 | 说明                                      |
|-------|--------|------------------------------------------|
| 首页   | 95%    | Banner轮播 + 快捷入口 + 分类标签 + 瀑布流 |
| 制作页  | 90%    | 三步骤流程 + 照片上传 + 模板选择 + 生成动画 |
| 结果页  | 90%    | 大图轮播 + 缩略图 + 保存/分享操作          |
| 详情页  | 85%    | 模板预览 + 信息 + 示例图 + 底部操作栏      |
| 我的    | 90%    | 用户卡片 + 统计 + 历史列表 + 功能菜单      |

## ⚡ 即梦API对接指南

### 当前状态

项目中的 `jimeng` 云函数已预留完整的API对接结构，包含：

- ✅ 图片上传接口
- ✅ 任务创建接口
- ✅ 状态轮询机制
- ✅ 结果存储流程
- ✅ 模板提示词映射
- ✅ 错误重试机制

### 你需要做的

1. 获取即梦API的访问凭证
2. 参考即梦官方API文档，修改 `jimeng/index.js` 中的 `JimengAPI` 类
3. 主要需要修改以下方法：
   - `getAccessToken()` — 鉴权方式
   - `uploadImage()` — 图片上传
   - `createTask()` — 创建生图任务
   - `queryTask()` — 查询任务状态

### API调用流程

```
用户上传照片 → 云存储 → 调用即梦上传接口
                         ↓
                    创建生图任务
                         ↓
                    轮询任务状态 (每5秒)
                         ↓
                  任务完成 → 下载结果图
                         ↓
                   保存到云存储
                         ↓
                    前端展示结果
```

## 📋 待办清单

- [ ] 完善即梦API真实对接（需提供API Key）
- [ ] 添加微信支付功能（VIP会员）
- [ ] 添加用户收藏功能
- [ ] 添加分享到朋友圈功能
- [ ] 添加照片管理功能
- [ ] 优化加载性能和缓存
- [ ] 添加更多模板风格

## 📄 License

MIT License

---

> 🦆 **妙鸭** - 让每个人都能拥有专业级写真大片
