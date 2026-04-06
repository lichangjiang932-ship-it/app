/**
 * 即梦API配置
 *
 * 使用方式（推荐）：
 * 在云开发控制台 → 设置 → 环境变量中配置：
 *   - JIMENG_API_KEY
 *   - JIMENG_API_SECRET（如有）
 *   - JIMENG_API_URL
 *
 * ⚠️ 请勿在此文件中填写真实密钥，避免泄露到代码仓库
 */

const JIMENG_CONFIG = {
  apiKey: process.env.JIMENG_API_KEY || '',
  apiSecret: process.env.JIMENG_API_SECRET || '',
  baseUrl: process.env.JIMENG_API_URL || 'https://jimeng.jianying.com/api',

  model: 'jimeng-v2',

  output: {
    width: 1024,
    height: 1024,
    quality: 95,
    format: 'jpg',
  },

  generation: {
    steps: 30,
    cfgScale: 7.5,
    seed: -1,
    sampler: 'euler',
  },
};

module.exports = JIMENG_CONFIG;
