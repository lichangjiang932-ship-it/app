/**
 * 公共默认数据 — 单一数据源
 * 前端页面和云函数共用，避免重复定义
 */

const defaultTemplates = [
  { id: '1', name: '韩系证件照', cover: '/images/demo/template1.jpg', style: '证件照', category: 'idphoto', useCount: 128000, likeCount: 52000, isNew: false, isHot: true, price: 0, description: '清新自然的韩式证件照，适用于简历、签证等各种场景' },
  { id: '2', name: '法式油画', cover: '/images/demo/template2.jpg', style: '写真', category: 'photo', useCount: 96000, likeCount: 45000, isNew: true, isHot: true, price: 0, description: '文艺复兴风格的油画质感写真，优雅而永恒' },
  { id: '3', name: '日系清新', cover: '/images/demo/template3.jpg', style: '写真', category: 'photo', useCount: 85000, likeCount: 38000, isNew: false, isHot: false, price: 0, description: '日系小清新风格，柔和自然的色调' },
  { id: '4', name: '赛博朋克', cover: '/images/demo/template4.jpg', style: '艺术', category: 'art', useCount: 72000, likeCount: 34000, isNew: true, isHot: true, price: 0, description: '未来科技感的赛博朋克风，霓虹灯下的你' },
  { id: '5', name: '港风复古', cover: '/images/demo/template5.jpg', style: '复古', category: 'vintage', useCount: 68000, likeCount: 31000, isNew: false, isHot: false, price: 0, description: '90年代港风复古写真，王家卫电影质感' },
  { id: '6', name: '校园青春', cover: '/images/demo/template6.jpg', style: '写真', category: 'photo', useCount: 65000, likeCount: 29000, isNew: false, isHot: false, price: 0, description: '青春校园风，回忆那些年的美好时光' },
  { id: '7', name: '迪士尼公主', cover: '/images/demo/template7.jpg', style: '卡通', category: 'cartoon', useCount: 110000, likeCount: 58000, isNew: true, isHot: true, price: 0, description: '化身迪士尼动画中的公主/王子' },
  { id: '8', name: '商务精英', cover: '/images/demo/template8.jpg', style: '证件照', category: 'idphoto', useCount: 54000, likeCount: 22000, isNew: false, isHot: false, price: 0, description: '专业商务形象照，职场必备' },
  { id: '9', name: '古风汉服', cover: '/images/demo/template9.jpg', style: '艺术', category: 'art', useCount: 92000, likeCount: 42000, isNew: false, isHot: true, price: 0, description: '穿越千年的古风之美，汉服写真' },
  { id: '10', name: '情侣甜蜜', cover: '/images/demo/template10.jpg', style: '写真', category: 'couple', useCount: 48000, likeCount: 20000, isNew: true, isHot: false, price: 0, description: '记录你们的甜蜜瞬间' },
  { id: '11', name: '油画肖像', cover: '/images/demo/template11.jpg', style: '艺术', category: 'art', useCount: 58000, likeCount: 26000, isNew: false, isHot: false, price: 0, description: '古典油画风格的个人肖像' },
  { id: '12', name: '动漫头像', cover: '/images/demo/template12.jpg', style: '卡通', category: 'cartoon', useCount: 76000, likeCount: 35000, isNew: false, isHot: true, price: 0, description: '二次元动漫风格头像生成' },
];

// 按分类筛选模板
function filterTemplates(templates, category) {
  if (!category || category === 'all') return templates;
  if (category === 'hot') return templates.filter(t => t.isHot);
  if (category === 'new') return templates.filter(t => t.isNew);
  return templates.filter(t => t.category === category);
}

module.exports = {
  defaultTemplates,
  filterTemplates,
};
