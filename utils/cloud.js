/**
 * utils/cloud.js — 云开发工具封装
 * 统一云函数调用、安全 storage、重试机制
 */

// ===== 安全 Storage =====
function safeGet(key) {
  try { return wx.getStorageSync(key); } catch (e) { console.warn('safeGet:', key, e); return null; }
}
function safeSet(key, value) {
  try { wx.setStorageSync(key, value); return true; } catch (e) { console.warn('safeSet:', key, e); return false; }
}
function safeRemove(key) {
  try { wx.removeStorageSync(key); return true; } catch (e) { console.warn('safeRemove:', key, e); return false; }
}

// ===== 重试机制 =====
async function withRetry(fn, retries = 2, delayMs = 500) {
  let lastErr;
  for (let i = 0; i <= retries; i++) {
    try {
      return await fn();
    } catch (e) {
      lastErr = e;
      if (i < retries) {
        await new Promise(r => setTimeout(r, delayMs * Math.pow(2, i)));
      }
    }
  }
  throw lastErr;
}

// ===== 云函数调用（统一入口） =====
async function call(name, data = {}) {
  try {
    const res = await withRetry(() => wx.cloud.callFunction({ name, data }), 2, 300);
    return res.result;
  } catch (e) {
    console.error(`云函数 ${name} 失败:`, e.message);
    throw e;
  }
}

// ===== 临时链接缓存 =====
const _urlCache = new Map();
const URL_TTL = 60 * 60 * 1000; // 1小时

async function getTempUrl(fileID) {
  if (!fileID) return '';
  const cached = _urlCache.get(fileID);
  if (cached && cached.expire > Date.now()) return cached.url;
  try {
    const res = await withRetry(() => wx.cloud.getTempFileURL({ fileList: [fileID] }), 2, 300);
    const url = res.fileList?.[0]?.tempFileURL || '';
    if (url) _urlCache.set(fileID, { url, expire: Date.now() + URL_TTL });
    return url;
  } catch (e) {
    console.error('获取临时链接失败:', e.message);
    return '';
  }
}

function clearUrlCache() {
  _urlCache.clear();
}

module.exports = {
  safeGet, safeSet, safeRemove,
  withRetry,
  call,
  getTempUrl, clearUrlCache,
};
