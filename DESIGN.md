# Design System: 妙鸭 AI写真小程序

## 1. Visual Theme & Atmosphere

妙鸭是一款面向年轻女性用户的 AI 写真生成小程序，视觉风格灵感来自原版妙鸭相机：温暖、精致、有少女感。整体以渐变粉紫色为主调，传递「梦幻大片」的质感——不是冷冰冰的工具，而是闺蜜推荐的拍照神器。

圆角统一使用大圆角（24rpx-48rpx），营造柔软亲和感。阴影克制使用，以轻量级为主（0 4rpx 20rpx rgba(0,0,0,0.06)），让界面感觉轻盈漂浮。导航栏采用毛玻璃模糊效果（backdrop-filter: blur(20px)），增加现代感和层次。

**Key Characteristics:**
- 渐变粉紫主色调 `#FF6B9D → #C44FE2`，贯穿按钮、强调文字、装饰元素
- 系统字体栈（PingFang SC 优先），不使用自定义字体，确保加载速度
- 统一大圆角 24rpx（卡片），48rpx（主按钮、弹窗），16rpx（小元素）
- 轻量阴影系统，最多两层，避免视觉沉重
- 深色文字 `#1a1a2e` 而非纯黑，更温和
- 骨架屏加载动画（渐变色 shimmer），而非 spinner
- 8rpx 基线网格的间距系统，保持节奏一致

## 2. Color Palette & Roles

### Primary & Brand
- **渐变起点** (`#FF6B9D`): 品牌主色，渐变起始色，按钮背景渐变的粉色端
- **渐变终点** (`#C44FE2`): 品牌辅色，渐变结束色，按钮背景渐变的紫色端
- **主按钮渐变**: `linear-gradient(135deg, #FF6B9D 0%, #C44FE2 100%)`
- **渐变文字**: 同上渐变，`-webkit-background-clip: text`

### Accent Colors
- **紫色辅色** (`#6C5CE7`): 次要功能入口、百变头像 icon 背景
- **紫色浅** (`#a29bfe`): 与 #6C5CE7 搭配做渐变
- **绿色** (`#00b894`): 证件照 icon 背景、成功状态
- **绿色浅** (`#55efc4`): 与 #00b894 搭配做渐变
- **橙色** (`#fdcb6e`): 照片修复 icon 背景、价格/优惠标签
- **橙色深** (`#e17055`): 与 #fdcb6e 搭配做渐变
- **按钮阴影粉** (`rgba(255, 107, 157, 0.3)`): 主按钮下方的粉色彩影

### Text
- **主文字** (`#1a1a2e`): 正文、标题、核心内容
- **次要文字** (`#666666`): 描述文字、辅助说明
- **弱文字** (`#999999`): tab 未选中色、时间戳、placeholder
- **占位文字** (`#cccccc`): 图片加载失败、骨架屏文字

### Surfaces & Borders
- **页面背景** (`#f5f5f7`): 全局背景色，极浅灰蓝
- **卡片背景** (`#ffffff`): 所有卡片、弹窗内容区
- **边框默认** (`#e0e0e0`): 次要按钮边框、分割线
- **分割线** (`#f0f0f0`): 细分割线 1rpx

### Shadow System
- **浮层** (`0 8rpx 32rpx rgba(0,0,0,0.1)`): 弹窗、底部弹出层
- **卡片悬浮** (`0 4rpx 16rpx rgba(0,0,0,0.05)`): 卡片 hover/抬起态
- **卡片静止** (`0 2rpx 12rpx rgba(0,0,0,0.04)`): 默认卡片
- **按钮** (`0 8rpx 28rpx rgba(255, 107, 157, 0.3)`): 主按钮专用

### Dark Mode
- **页面背景** (`#1a1a2e`): 暗色模式下的页面底色
- 暗黑模式目前仅适配了页面背景色，其他元素待完善

## 3. Typography Rules

### Font Family
- **Primary**: 系统字体栈 `-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, "PingFang SC", "Microsoft YaHei", sans-serif`
- **无自定义字体**: 纯系统字体，零加载时间
- **字体平滑**: `-webkit-font-smoothing: antialiased`

### Hierarchy (rpx 单位，基于750rpx设计稿)

| Role | Size | Weight | Line Height | Notes |
|------|------|--------|-------------|-------|
| 页面标题 | 36rpx | 700 | 1.4 | 导航栏标题、页面大标题 |
| 区块标题 | 32rpx | 700 | 1.4 | section-title |
| 卡片标题 | 28rpx | 600 | 1.4 | 模板名、作品名 |
| 正文 | 28rpx | 400 | 1.5 | 全局默认 font-size |
| 辅助文字 | 24rpx | 400 | 1.4 | 使用人数、描述文字 |
| 小字/标签 | 22rpx | 500 | 1.3 | tag 标签、时间戳 |
| 极小字 | 20rpx | 400 | 1.3 | 版权信息、版本号 |

### Principles
- **全局字号 28rpx** 作为正文基准，24rpx 为辅助，22rpx 为标签
- **数字格式化**: 大于1万显示为 "X.X万"（`formatNumber` 工具函数）
- **文字溢出**: 单行用 `ellipsis`，多行用 `ellipsis-2` / `ellipsis-3`（-webkit-line-clamp）

## 4. Component Stylings

### Buttons

**主按钮 (btn-gradient)**
- Background: `linear-gradient(135deg, #FF6B9D 0%, #C44FE2 100%)`
- Text: `#ffffff`
- Padding: 20rpx 48rpx
- Radius: 48rpx（全胶囊形）
- Font: 30rpx weight 700, letter-spacing 2rpx
- Shadow: `0 8rpx 28rpx rgba(255, 107, 157, 0.3)`
- Disabled: background `#e0e0e0`, text `#bbb`, 无阴影
- Use: "下一步"、"开始生成"、"保存到相册"

**次要按钮 (btn-secondary)**
- Background: `#ffffff`
- Text: `#666`
- Border: 2rpx solid `#e0e0e0`
- Radius: 32rpx
- Font: 28rpx weight 500
- Use: "上一步"、"相册"、"拍照"

### Cards

**模板卡片 (瀑布流)**
- Background: `#ffffff`
- Radius: 24rpx (radius-md)
- Shadow: `0 2rpx 12rpx rgba(0,0,0,0.04)`
- Image: aspectFill, 顶部圆角 24rpx
- Info padding: 16rpx
- Tags: 左上角绝对定位, 8rpx radius, 半透明背景

**个人中心卡片**
- Background: 渐变背景 + 毛玻璃
- Radius: 24rpx
- 包含头像、昵称、ID、VIP入口、统计数据行

### Tags / Badges
- Padding: 4rpx 14rpx
- Radius: 8rpx (radius-xs)
- Font: 22rpx weight 500
- 类型: "NEW"（粉色）、风格标签（灰色半透明）

### Navigation Bar
- Fixed 定位
- Background: `rgba(255,255,255,0.92)` + `backdrop-filter: blur(20px)`
- 高度: 状态栏 + 44px（兼容胶囊按钮区域）
- Title: 支持渐变文字模式

### Skeleton Screen
- Background: `linear-gradient(90deg, #f0f0f0 25%, #e8e8e8 37%, #f0f0f0 63%)`
- Background-size: `200% 100%`
- Animation: shimmer 1.4s ease-in-out infinite
- Use: 首页加载、我的作品加载

### Loading Spinner
- Size: 40rpx × 40rpx
- Border: 4rpx solid `#eee`, top-color `#FF6B9D`
- Animation: spin 0.8s linear infinite
- Use: 加载更多、操作等待

### TabBar
- Color: `#999999`
- SelectedColor: `#FF6B9D`
- Background: `#ffffff`
- Border: white（无可见边线）
- 3个 tab: 发现 / AI写真 / 我的

## 5. Layout Principles

### Spacing Scale (8rpx baseline grid)
| Token | Value | Use |
|-------|-------|-----|
| gap-1 | 48rpx | 大区块间距（区块之间） |
| gap-2 | 24rpx | 区块内卡片间距 |
| gap-3 | 16rpx | 卡片内元素间距 |
| gap-4 | 8rpx | 紧凑元素间距（标签、图标旁） |

### Container
- 标准容器: `padding: 0 24rpx`
- 宽容器: `padding: 0 32rpx`

### Safe Area
- 底部安全区: `padding-bottom: env(safe-area-inset-bottom)`
- 刘海屏适配: 通过 nav-bar 组件动态计算

### Grid / Waterfall
- 瀑布流: 两列等宽，通过累计高度分配到更矮的一列
- 照片上传网格: 3列等宽
- 金刚区: 4列等宽

### Principles
- **8rpx 基线网格**: 所有间距必须是 8 的倍数
- **底部固定操作栏**: 制作页、详情页使用 `position: fixed` 底部栏 + 安全区适配
- **内容区不贴边**: 页面内容 `padding: 0 24rpx`，避免贴屏

## 6. Depth & Elevation

### Shadow Layers
- **Level 0** (卡片静止): `0 2rpx 12rpx rgba(0,0,0,0.04)` — 几乎不可见，暗示存在
- **Level 1** (卡片悬浮): `0 4rpx 16rpx rgba(0,0,0,0.05)` — 轻微抬起
- **Level 2** (浮层/弹窗): `0 8rpx 32rpx rgba(0,0,0,0.1)` — 明确的层叠关系
- **Level Special** (主按钮): `0 8rpx 28rpx rgba(255, 107, 157, 0.3)` — 品牌色彩影

### Surface Hierarchy
- 最底层: 页面背景 `#f5f5f7`
- 中间层: 白色卡片 `#ffffff` + Level 0/1 shadow
- 最上层: 弹窗/浮层 `#ffffff` + Level 2 shadow

### Glass Effect
- 导航栏: `background: rgba(255,255,255,0.92); backdrop-filter: blur(20px)`
- 使用场景: 固定导航栏、吸顶分类栏

## 7. Do's and Don'ts

### Do's ✅
- 使用渐变按钮，保持品牌一致性
- 骨架屏优于 spinner，给用户"内容在加载"的感觉
- 点击反馈加 `hover-class="tap"`（opacity 0.7 + scale 0.96）
- 图片统一 `mode="aspectFill"`，配合 `lazy-load`
- 大数字格式化为 "X.X万"
- 文字溢出用 ellipsis 类，不溢出容器
- 底部操作栏记得加 `safe-area-bottom`

### Don'ts ❌
- 不使用纯黑 `#000000` 作为文字色（用 `#1a1a2e`）
- 不使用尖锐的 0 圆角（最小 8rpx）
- 不在同一界面混用超过 3 种强调色
- 不让按钮文字超过 14 个中文字符
- 不跳过骨架屏直接显示空白页
- 不在瀑布流中使用 `Math.random()` 生成数据（会导致布局跳动）
- 不在 WXML 中使用箭头函数（小程序不支持）

## 8. Responsive Behavior

### 设计基准
- 设计稿宽度: 750rpx（微信小程序标准）
- 所有尺寸使用 rpx 单位，自动适配不同屏幕
- 最小适配: iPhone SE (375px 宽度)

### 图片适配
- 封面图: `mode="aspectFill"`（裁切填满）
- 结果预览: `mode="aspectFit"`（完整显示）
- 头像: `mode="aspectFill"`

### 触摸目标
- 最小可点击区域: 44px × 44px（iOS HIG 标准）
- 图片删除按钮: 40rpx 圆形，absolute 定位右上角

## 9. Agent Prompt Guide

### Quick Reference
```
主色渐变: linear-gradient(135deg, #FF6B9D, #C44FE2)
主文字色: #1a1a2e
次要文字: #666
弱文字: #999
背景: #f5f5f7
卡片: #fff + radius 24rpx + shadow 0 2rpx 12rpx rgba(0,0,0,0.04)
主按钮: 渐变 + radius 48rpx + 白色字 + 粉色彩影
次要按钮: #fff + border #e0e0e0 + radius 32rpx
间距: 48rpx(大) / 24rpx(中) / 16rpx(小) / 8rpx(微)
全局字号: 28rpx body / 24rpx 辅助 / 22rpx 标签
```

### Ready-to-Use Prompt
> 使用妙鸭设计系统构建页面：渐变粉色按钮 (#FF6B9D→#C44FE2)，白色卡片 24rpx 圆角，系统字体 28rpx 正文，8rpx 基线间距网格，骨架屏加载态，深色文字 #1a1a2e。所有交互元素添加 hover-class="tap" 按压反馈。
