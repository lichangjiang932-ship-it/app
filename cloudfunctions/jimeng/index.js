// cloudfunctions/jimeng/index.js
/**
 * 即梦AI生图云函数
 *
 * 配置方式：
 * 在云开发控制台 → 设置 → 环境变量中添加：
 *   JIMENG_API_KEY / JIMENG_API_SECRET / JIMENG_API_URL
 *
 * 即梦API文档：https://jimeng.jianying.com/
 */

const cloud = require('wx-server-sdk');
const axios = require('axios');
const FormData = require('form-data');

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });
const db = cloud.database();

// ========== 配置 ==========
const config = {
  apiKey: process.env.JIMENG_API_KEY,
  apiSecret: process.env.JIMENG_API_SECRET || '',
  apiUrl: process.env.JIMENG_API_URL || 'https://jimeng.jianying.com/api',
  defaultModel: 'jimeng-v2',
  outputWidth: 1024,
  outputHeight: 1024,
  outputQuality: 95,
};

// 检查配置
function assertConfig() {
  if (!config.apiKey) {
    throw new Error('即梦API Key未配置，请在云开发控制台设置环境变量 JIMENG_API_KEY');
  }
}

// ========== 即梦API客户端 ==========
class JimengAPI {
  constructor(cfg) {
    this.apiKey = cfg.apiKey;
    this.apiUrl = cfg.apiUrl;
    this.model = cfg.defaultModel;
  }

  /**
   * 获取API访问Token
   * TODO: 根据即梦实际鉴权方式实现
   */
  async getAccessToken() {
    return this.apiKey;
  }

  /**
   * 上传参考图片到即梦
   * @param {string} fileID - 云存储文件ID
   * @returns {string} 即梦侧的图片ID或URL
   */
  async uploadImage(fileID) {
    try {
      const fileRes = await cloud.downloadFile({ fileID });
      const buffer = fileRes.fileContent;
      const urlRes = await cloud.getTempFileURL({ fileList: [fileID] });
      const tempUrl = urlRes.fileList[0].tempFileURL;

      // TODO: 根据即梦API文档上传图片
      /*
      const token = await this.getAccessToken();
      const form = new FormData();
      form.append('image', buffer, { filename: 'photo.jpg' });
      const res = await axios.post(`${this.apiUrl}/upload`, form, {
        headers: {
          'Authorization': `Bearer ${token}`,
          ...form.getHeaders(),
        },
        timeout: 30000,
      });
      return res.data.image_id;
      */

      return tempUrl;
    } catch (e) {
      console.error('上传图片失败:', fileID, e.message);
      throw new Error(`图片上传失败: ${e.message}`);
    }
  }

  /**
   * 创建生图任务
   * TODO: 根据即梦API文档实现
   */
  async createTask({ imageUrls, templatePrompt, templateId }) {
    try {
      const token = await this.getAccessToken();

      // TODO: 替换为真实API调用
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
        timeout: 30000,
      });
      return { taskId: res.data.task_id, status: res.data.status };
      */

      // 模拟返回 — 接入真实API后删除
      console.log('即梦API - 创建任务:', { imageCount: imageUrls.length, templatePrompt, templateId });
      return {
        taskId: `jimeng_${Date.now()}`,
        status: 'submitted',
      };
    } catch (e) {
      console.error('创建生图任务失败:', e.message);
      throw new Error(`创建任务失败: ${e.message}`);
    }
  }

  /**
   * 查询任务状态
   * TODO: 根据即梦API文档实现
   */
  async queryTask(jimengTaskId) {
    try {
      const token = await this.getAccessToken();

      // TODO: 替换为真实API调用
      /*
      const res = await axios.get(`${this.apiUrl}/tasks/${jimengTaskId}`, {
        headers: { 'Authorization': `Bearer ${token}` },
        timeout: 15000,
      });
      return {
        status: res.data.status,
        results: res.data.images || [],
        progress: res.data.progress || 0,
      };
      */

      // 模拟返回 — 接入真实API后删除
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
      console.error('查询任务状态失败:', e.message);
      throw new Error(`查询任务失败: ${e.message}`);
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

  switch (action) {
    case 'generate': {
      assertConfig();
      const api = new JimengAPI(config);
      return await handleGenerate(api, event);
    }
    case 'queryStatus': {
      assertConfig();
      const api = new JimengAPI(config);
      return await handleQueryStatus(api, event);
    }
    case 'callback':
      return await handleCallback(event);
    default:
      return { error: 'Unknown action' };
  }
};

// 处理生成请求
async function handleGenerate(api, event) {
  const { taskId, photos, templateId } = event;

  if (!taskId || !photos || !photos.length || !templateId) {
    return { success: false, error: '参数不完整：需要 taskId, photos, templateId' };
  }

  try {
    await updateTaskStatus(taskId, 'processing', [], 10);

    const prompt = templatePrompts[templateId] || templatePrompts['2'];

    // 上传参考图片
    await updateTaskStatus(taskId, 'processing', [], 20);
    const imageUrls = [];
    for (const photo of photos) {
      try {
        const url = await api.uploadImage(photo);
        imageUrls.push(url);
      } catch (e) {
        console.error(`上传图片失败: ${photo}`, e.message);
      }
    }

    if (imageUrls.length === 0) {
      throw new Error('所有图片上传失败');
    }

    // 创建生图任务
    await updateTaskStatus(taskId, 'processing', [], 40);
    const result = await api.createTask({
      imageUrls,
      templatePrompt: prompt,
      templateId,
    });

    // 立即返回，前端轮询查询状态
    // 同时保存 jimengTaskId 供后续查询
    await db.collection('tasks').doc(taskId).update({
      data: {
        jimengTaskId: result.taskId,
        updatedAt: db.serverDate(),
      },
    });

    // 启动轻量轮询（云函数内最多轮询几次，避免超时）
    await pollWithLimit(api, taskId, result.taskId, 0, 3);

    return { success: true, jimengTaskId: result.taskId };
  } catch (e) {
    console.error('生成任务失败:', e.message);
    await updateTaskStatus(taskId, 'failed', [], 0, e.message);
    return { success: false, error: e.message };
  }
}

// 轻量轮询 — 云函数内最多轮几次，剩余交给前端 or 定时触发器
async function pollWithLimit(api, localTaskId, jimengTaskId, retries, maxPolls) {
  if (retries >= maxPolls) {
    // 超过云函数内轮询次数，状态保持 processing，由前端继续轮询
    console.log(`云函数内轮询已达上限(${maxPolls})，交给前端继续查询`);
    return;
  }

  try {
    const result = await api.queryTask(jimengTaskId);

    if (result.status === 'completed') {
      const cloudUrls = await saveResultsToCloud(result.results, localTaskId);
      await updateTaskStatus(localTaskId, 'completed', cloudUrls, 100);
    } else if (result.status === 'failed') {
      await updateTaskStatus(localTaskId, 'failed', [], 0, 'AI生成失败');
    } else {
      const progress = Math.min(40 + (retries + 1) * 15, 90);
      await updateTaskStatus(localTaskId, 'processing', [], progress);
      await sleep(5000);
      await pollWithLimit(api, localTaskId, jimengTaskId, retries + 1, maxPolls);
    }
  } catch (e) {
    console.error('查询任务失败:', e.message);
    // 不再无限重试，交给前端
  }
}

// 将结果图片保存到云存储
async function saveResultsToCloud(imageUrls, taskId) {
  const cloudUrls = [];
  for (let i = 0; i < imageUrls.length; i++) {
    try {
      const cloudPath = `results/${taskId}_${i}.jpg`;
      const res = await cloud.downloadFile({ fileID: imageUrls[i] }).catch(() => null);

      if (res && res.fileContent) {
        const uploadRes = await cloud.uploadFile({
          cloudPath,
          fileContent: res.fileContent,
        });
        cloudUrls.push(uploadRes.fileID);
      } else {
        // 外部URL，直接使用
        cloudUrls.push(imageUrls[i]);
      }
    } catch (e) {
      console.error('保存图片失败:', e.message);
      cloudUrls.push(imageUrls[i]);
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
    console.error('更新任务状态失败:', e.message);
  }
}

// 处理查询状态
async function handleQueryStatus(api, event) {
  const { jimengTaskId } = event;
  if (!jimengTaskId) return { error: '缺少 jimengTaskId' };
  return await api.queryTask(jimengTaskId);
}

// 处理回调
async function handleCallback(event) {
  const { taskId, status, results } = event;
  if (!taskId) return { error: '缺少 taskId' };
  const cloudUrls = results ? await saveResultsToCloud(results, taskId) : [];
  await updateTaskStatus(taskId, status, cloudUrls, status === 'completed' ? 100 : 0);
  return { success: true };
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
