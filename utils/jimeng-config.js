/**
 * 即梦API配置
 * 
 * 使用说明：
 * 1. 将你的即梦API密钥填入下方
 * 2. 或在云开发控制台设置环境变量
 * 3. 推荐使用环境变量方式，避免密钥泄露
 * 
 * 即梦API获取方式：
 * - 访问 https://jimeng.jianying.com/
 * - 注册/登录后在开发者中心获取API Key
 * - 参考官方文档了解接口详情
 */

const JIMENG_CONFIG = {
  // ========== 必填配置 ==========
  apiKey: '',       // 即梦API Key（必填）
  apiSecret: '',    // 即梦API Secret（如有）

  // ========== API地址 ==========
  // 请根据即梦官方文档填写正确的API地址
  baseUrl: 'https://jimeng.jianying.com/api',

  // ========== 模型配置 ==========
  model: 'jimeng-v2',  // 模型版本

  // ========== 输出配置 ==========
  output: {
    width: 1024,
    height: 1024,
    quality: 95,
    format: 'jpg',    // 输出格式：jpg / png
  },

  // ========== 生成参数 ==========
  generation: {
    steps: 30,         // 推理步数
    cfgScale: 7.5,     // 提示词引导强度
    seed: -1,          // 随机种子，-1为随机
    sampler: 'euler',  // 采样器
  },
};

module.exports = JIMENG_CONFIG;
