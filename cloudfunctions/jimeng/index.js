// cloudfunctions/jimeng/index.js
/**
 * 即梦AI生图云函数
 * 
 * ========================================
 * ⚠️  重要：使用前请配置以下内容
 * ========================================
 * 
 * 1. 在云开发控制台设置环境变量：
 *    - JIMENG_API_KEY: 你的即梦API Key
 *    - JIMENG_API_SECRET: 你的即梦API Secret（如有）
 *    - JIMENG_API_URL: 即梦API的基础URL
 * 
 * 2. 或直接修改下方 config 对象
 * 
 * 3. 即梦API文档：https://jimeng.jianying.com/ （请参考官方文档完善接口调用）
 * ========================================
 */

const cloud = require('wx-server-sdk');
const axios = require('axios');
const FormData = require('form-data');

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });
const db = cloud.database();

// ========== 配置区域 ==========
const config = {
  // 即梦API配置 - 请替换为你的实际配置
  apiKey: process.env.JIMENG_API_KEY || 'YOUR_JIMENG_API_KEY',
  apiSecret: process.env.JIMENG_API_SECRET || '',
  apiUrl: process.env.JIMENG_API_URL || 'https://jimeng.jianying.com/api',

  // 模型配置
  defaultModel: 'jimeng-v2', // 即梦模型版本
  maxRetries: 3,
  retryDelay: 5000, // ms

  // 图片配置
  outputWidth: 1024,
  outputHeight: 1024,
  outputQuality: 95,
};

// ========== 即梦API客户端 ==========
class JimengAPI {
  constructor(cfg) {
    this.apiKey = cfg.apiKey;
    this.apiUrl = cfg.apiUrl;
    this.model = cfg.defaultModel;
  }

  /**
   * 获取API访问Token
   * 即梦可能使用OAuth或API Key鉴权，请根据实际API文档调整
   */
  async getAccessToken() {
    // TODO: 根据即梦实际鉴权方式实现
    // 示例：使用API Key作为Bearer Token
    return this.apiKey;
  }

  /**
   * 上传参考图片到即梦
   * @param {string} fileID - 云存储文件ID
   * @returns {string} 即梦侧的图片ID或URL
   */
  async uploadImage(fileID) {
    try {
      // 从云存储下载文件
      const fileRes = await cloud.downloadFile({ fileID: fileID });
      const buffer = fileRes.fileContent;

      // 获取临时访问URL
      const urlRes = await cloud.getTempFileURL({ fileList: [fileID] });
      const tempUrl = urlRes.fileList[0].tempFileURL;

      // TODO: 根据即梦API文档上传图片
      // 示例实现（需根据实际API调整）：
      /*
      const token = await this.getAccessToken();
      const form = new FormData();
      form.append('image', buffer, { filename: 'photo.jpg' });

      const res = await axios.post(`${this.apiUrl}/upload`, form, {
        headers: {
          'Authorization': `Bearer ${token}`,
          ...form.getHeaders(),
        },
      });
      return res.data.image_id;
      */

      // 临时方案：直接返回临时URL
      return tempUrl;
    } catch (e) {
      console.error('上传图片失败:', e);
      throw e;
    }
  }

  /**
   * 创建生图任务
   * @param {Object} params - 生成参数
   * @param {string[]} params.imageUrls - 参考图片URL数组
   * @param {string} params.templatePrompt - 模板对应的提示词
   * @param {string} params.templateId - 模板ID
   * @returns {Object} 任务信息
   */
  async createTask({ imageUrls, templatePrompt, templateId }) {
    try {
      const token = await this.getAccessToken();

      // TODO: 根据即梦API文档创建生图任务
      // 以下是示例结构，请根据实际API调整
      /*
      const res = await axios.post(`${this.apiUrl}/tasks`, {
        model: this.model,
        images: imageUrls,
        prompt: templatePrompt,
        parameters: {
          width: config.outputWidth,
          height: config.outputHeight,
          quality: config.outputQuality,
        },
      }, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      return {
        taskId: res.data.task_id,
        status: res.data.status,
      };
      */

      // 模拟返回（删除此段，使用上面的真实API调用）
      console.log('即梦API - 创建任务:', { imageUrls: imageUrls.length, templatePrompt, templateId });
      return {
        taskId: `jimeng_${Date.now()}`,
        status: 'submitted',
      };
    } catch (e) {
      console.error('创建生图任务失败:', e);
      throw e;
    }
  }

  /**
   * 查询任务状态
   * @param {string} jimengTaskId - 即梦任务ID
   * @returns {Object} 任务状态和结果
   */
  async queryTask(jimengTaskId) {
    try {
      const token = await this.getAccessToken();

      // TODO: 根据即梦API文档查询任务
      /*
      const res = await axios.get(`${this.apiUrl}/tasks/${jimengTaskId}`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      return {
        status: res.data.status, // 'processing' | 'completed' | 'failed'
        results: res.data.images || [], // 生成的图片URL数组
        progress: res.data.progress || 0,
      };
      */

      // 模拟返回
      console.log('即梦API - 查询任务:', jimengTaskId);
      return {
        status: 'completed',
        results: [
          'https://via.placeholder.com/1024x1024/FF6B9D/ffffff?text=Result+1',
          'https://via.placeholder.com/1024x1024/C44FE2/ffffff?text=Result+2',
          'https://via.placeholder.com/1024x1024/6C5CE7/ffffff?text=Result+3',
          'https://via.placeholder.com/1024x1024/00b894/ffffff?text=Result+4',
        ],
        progress: 100,
      };
    } catch (e) {
      console.error('查询任务状态失败:', e);
      throw e;
    }
  }
}

// ========== 模板提示词映射 ==========
const templatePrompts = {
  '1': 'Professional Korean-style ID photo, clean white background, natural lighting, formal attire, neutral expression, high resolution portrait',
  '2': 'French oil painting style portrait, Renaissance aesthetics, warm golden tones, soft brushstrokes, artistic composition, classical beauty',
  '3': 'Japanese fresh style portrait, soft natural lighting, pastel colors, cherry blossom atmosphere, gentle expression, clean background',
  '4': 'Cyberpunk style portrait, neon lights, futuristic city background, high-tech atmosphere, dramatic lighting, vibrant colors',
  '5': 'Hong Kong retro style portrait, 90s film grain, warm vintage tones, moody lighting, Wong Kar-wai aesthetics, cinematic look',
  '6': 'Campus youth style portrait, bright daylight, school uniform, energetic atmosphere, natural smile, outdoor setting',
  '7': 'Disney animation style character, princess/prince aesthetic, magical sparkles, vibrant colors, dreamy background, fairytale',
  '8': 'Professional business portrait, corporate attire, clean studio lighting, confident expression, executive style, sharp focus',
  '9': 'Ancient Chinese Hanfu portrait, traditional Chinese aesthetics, ethereal atmosphere, flowing robes, ink painting style background',
  '10': 'Romantic couple portrait, soft bokeh background, warm lighting, intimate pose, dreamy atmosphere, love story',
  '11': 'Classical oil painting portrait, Rembrandt lighting, rich textures, dramatic shadows, museum quality, fine art',
  '12': 'Anime style character portrait, manga aesthetics, vibrant colors, dynamic pose, detailed illustration, Japanese animation style',
};

// ========== 主函数 ==========
exports.main = async (event, context) => {
  const { action } = event;
  const api = new JimengAPI(config);

  switch (action) {
    case 'generate':
      return await handleGenerate(api, event);

    case 'queryStatus':
      return await handleQueryStatus(api, event);

    case 'callback':
      // 即梦回调接口（如果即梦支持webhook）
      return await handleCallback(event);

    default:
      return { error: 'Unknown action' };
  }
};

// 处理生成请求
async function handleGenerate(api, event) {
  const { taskId, photos, templateId } = event;

  try {
    // 1. 更新任务状态为处理中
    await updateTaskStatus(taskId, 'processing', [], 10);

    // 2. 获取模板提示词
    const prompt = templatePrompts[templateId] || templatePrompts['2'];

    // 3. 上传所有参考图片到即梦
    await updateTaskStatus(taskId, 'processing', [], 20);
    const imageUrls = [];
    for (const photo of photos) {
      try {
        const url = await api.uploadImage(photo);
        imageUrls.push(url);
      } catch (e) {
        console.error(`上传图片失败: ${photo}`, e);
      }
    }

    if (imageUrls.length === 0) {
      throw new Error('所有图片上传失败');
    }

    // 4. 调用即梦API创建任务
    await updateTaskStatus(taskId, 'processing', [], 40);
    const result = await api.createTask({
      imageUrls,
      templatePrompt: prompt,
      templateId,
    });

    // 5. 轮询等待结果（异步处理）
    await pollAndComplete(api, taskId, result.taskId);

    return { success: true, taskId: result.taskId };
  } catch (e) {
    console.error('生成任务失败:', e);
    await updateTaskStatus(taskId, 'failed', [], 0, e.message);
    return { success: false, error: e.message };
  }
}

// 轮询等待即梦任务完成
async function pollAndComplete(api, localTaskId, jimengTaskId, retries = 0) {
  if (retries >= config.maxRetries * 20) {
    // 超过最大重试次数（约10分钟）
    await updateTaskStatus(localTaskId, 'failed', [], 0, '生成超时，请重试');
    return;
  }

  try {
    const result = await api.queryTask(jimengTaskId);

    if (result.status === 'completed') {
      // 将生成结果保存到云存储
      const cloudUrls = await saveResultsToCloud(result.results, localTaskId);
      await updateTaskStatus(localTaskId, 'completed', cloudUrls, 100);
    } else if (result.status === 'failed') {
      await updateTaskStatus(localTaskId, 'failed', [], 0, 'AI生成失败');
    } else {
      // 继续等待
      const progress = Math.min(40 + retries * 2, 95);
      await updateTaskStatus(localTaskId, 'processing', [], progress);

      // 延迟后重试
      await sleep(config.retryDelay);
      await pollAndComplete(api, localTaskId, jimengTaskId, retries + 1);
    }
  } catch (e) {
    console.error('查询任务失败，重试中...', e);
    await sleep(config.retryDelay);
    await pollAndComplete(api, localTaskId, jimengTaskId, retries + 1);
  }
}

// 将结果图片保存到云存储
async function saveResultsToCloud(imageUrls, taskId) {
  const cloudUrls = [];
  for (let i = 0; i < imageUrls.length; i++) {
    try {
      const cloudPath = `results/${taskId}_${i}.jpg`;
      const res = await cloud.downloadFile({
        fileID: imageUrls[i], // 如果是云文件ID
      }).catch(() => null);

      if (res && res.fileContent) {
        const uploadRes = await cloud.uploadFile({
          cloudPath,
          fileContent: res.fileContent,
        });
        cloudUrls.push(uploadRes.fileID);
      } else {
        // 如果是外部URL，暂时直接使用
        cloudUrls.push(imageUrls[i]);
      }
    } catch (e) {
      console.error(`保存图片失败:`, e);
      cloudUrls.push(imageUrls[i]); // 降级使用原始URL
    }
  }
  return cloudUrls;
}

// 更新任务状态
async function updateTaskStatus(taskId, status, results, progress, errorMsg) {
  try {
    await db.collection('tasks').doc(taskId).update({
      data: {
        status,
        results: results || [],
        progress: progress || 0,
        errorMsg: errorMsg || '',
        updatedAt: db.serverDate(),
      },
    });
  } catch (e) {
    console.error('更新任务状态失败:', e);
  }
}

// 处理查询状态
async function handleQueryStatus(api, event) {
  const { jimengTaskId } = event;
  return await api.queryTask(jimengTaskId);
}

// 处理回调
async function handleCallback(event) {
  // TODO: 如果即梦支持webhook回调，在这里处理
  const { taskId, status, results } = event;
  const cloudUrls = results ? await saveResultsToCloud(results, taskId) : [];
  await updateTaskStatus(taskId, status, cloudUrls, status === 'completed' ? 100 : 0);
  return { success: true };
}

// 工具函数
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
