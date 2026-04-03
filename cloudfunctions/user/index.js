// cloudfunctions/user/index.js
const cloud = require('wx-server-sdk');
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });
const db = cloud.database();

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
        return { success: false, error: e.message };
      }

    case 'stats':
      try {
        const tasksCol = db.collection('tasks');
        const historyCount = await tasksCol.where({ _openid: OPENID, status: 'completed' }).count();
        const photoCount = await tasksCol.where({ _openid: OPENID }).count();
        return {
          historyCount: historyCount.total,
          photoCount: photoCount.total * 4, // 每次生成4张
          favoriteCount: 0,
        };
      } catch (e) {
        return { historyCount: 0, photoCount: 0, favoriteCount: 0 };
      }

    default:
      return { error: 'Unknown action' };
  }
};
