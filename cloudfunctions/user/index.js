// cloudfunctions/user/index.js
const cloud = require('wx-server-sdk');
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });
const db = cloud.database();
const _ = db.command;

exports.main = async (event, context) => {
  const { OPENID } = cloud.getWXContext();
  const { action, userInfo } = event;

  switch (action) {
    case 'getOpenid':
      return { openid: OPENID };

    case 'updateProfile':
      try {
        const userCol = db.collection('users');
        const exist = await userCol.where({ _openid: OPENID }).get();
        if (exist.data.length > 0) {
          await userCol.where({ _openid: OPENID }).update({
            data: { userInfo, updatedAt: db.serverDate() },
          });
        } else {
          await userCol.add({
            data: { _openid: OPENID, userInfo, createdAt: db.serverDate(), updatedAt: db.serverDate() },
          });
        }
        return { success: true };
      } catch (e) {
        console.error('更新用户资料失败:', e.message);
        return { success: false, error: e.message };
      }

    case 'stats':
      try {
        const tasksCol = db.collection('tasks');
        const myTasks = tasksCol.where({ _openid: OPENID });

        const [completedRes, totalRes] = await Promise.all([
          myTasks.where({ status: 'completed' }).count(),
          myTasks.count(),
        ]);

        // 统计实际生成的图片总数（遍历 completed 任务的 results 数组长度）
        let photoCount = 0;
        try {
          const completedTasks = await myTasks.where({ status: 'completed' }).field({ results: true }).get();
          photoCount = completedTasks.data.reduce((sum, t) => sum + (t.results ? t.results.length : 0), 0);
        } catch (_) {
          // 降级：使用任务数 × 4 估算
          photoCount = completedRes.total * 4;
        }

        return {
          works: completedRes.total,
          favorites: 0,
          likes: 0,
          following: 0,
          historyCount: completedRes.total,
          photoCount,
        };
      } catch (e) {
        return { works: 0, favorites: 0, likes: 0, following: 0, historyCount: 0, photoCount: 0 };
      }

    default:
      return { error: 'Unknown action' };
  }
};
