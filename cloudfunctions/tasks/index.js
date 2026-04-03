// cloudfunctions/tasks/index.js
const cloud = require('wx-server-sdk');
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });
const db = cloud.database();
const _ = db.command;

exports.main = async (event, context) => {
  const { OPENID } = cloud.getWXContext();
  const { action, photos, templateId, taskId, page, pageSize } = event;

  switch (action) {
    case 'create':
      // 创建生成任务
      try {
        const taskData = {
          _openid: OPENID,
          photos,            // 用户上传的照片 fileID 数组
          templateId,        // 选择的模板ID
          status: 'pending', // pending -> processing -> completed / failed
          results: [],       // 生成结果
          errorMsg: '',
          progress: 0,
          createdAt: db.serverDate(),
          updatedAt: db.serverDate(),
        };

        const res = await db.collection('tasks').add({ data: taskData });

        // 触发异步生成任务（调用即梦API）
        await cloud.callFunction({
          name: 'jimeng',
          data: {
            action: 'generate',
            taskId: res._id,
            photos,
            templateId,
          },
        });

        return { taskId: res._id, success: true };
      } catch (e) {
        return { success: false, error: e.message };
      }

    case 'status':
      // 查询任务状态
      try {
        const res = await db.collection('tasks').doc(taskId).get();
        return res.data;
      } catch (e) {
        return { status: 'unknown', error: e.message };
      }

    case 'detail':
      // 获取任务详情
      try {
        const res = await db.collection('tasks').doc(taskId).get();
        return res.data;
      } catch (e) {
        return null;
      }

    case 'myList':
      // 我的任务列表
      try {
        const countRes = await db.collection('tasks').where({ _openid: OPENID }).count();
        const res = await db.collection('tasks')
          .where({ _openid: OPENID })
          .orderBy('createdAt', 'desc')
          .skip(((page || 1) - 1) * (pageSize || 10))
          .limit(pageSize || 10)
          .get();
        return { data: res.data, total: countRes.total };
      } catch (e) {
        return { data: [], total: 0 };
      }

    case 'updateStatus':
      // 更新任务状态（由jimeng云函数调用）
      try {
        await db.collection('tasks').doc(taskId).update({
          data: {
            status: event.status,
            results: event.results || [],
            progress: event.progress || 0,
            errorMsg: event.errorMsg || '',
            updatedAt: db.serverDate(),
          },
        });
        return { success: true };
      } catch (e) {
        return { success: false, error: e.message };
      }

    default:
      return { error: 'Unknown action' };
  }
};
