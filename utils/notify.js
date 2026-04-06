/**
 * utils/notify.js — 统一通知接口
 */

function success(title, duration = 1500) {
  try { wx.showToast({ title, icon: 'success', duration }); } catch (e) {}
}

function info(title, duration = 1500) {
  try { wx.showToast({ title, icon: 'none', duration }); } catch (e) {}
}

function error(title, duration = 2000) {
  try { wx.showToast({ title, icon: 'none', duration }); } catch (e) {}
}

function confirm(options) {
  return new Promise(resolve => {
    try {
      wx.showModal({
        title: options.title || '',
        content: options.content || '',
        showCancel: options.showCancel !== false,
        confirmText: options.confirmText || '确定',
        cancelText: options.cancelText || '取消',
        success: res => resolve(res),
        fail: () => resolve({ confirm: false, cancel: true }),
      });
    } catch (e) {
      resolve({ confirm: false, cancel: true });
    }
  });
}

module.exports = { success, info, error, confirm };
