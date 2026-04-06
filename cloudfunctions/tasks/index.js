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
      return await handleCreate(OPENID, photos, templateId);

    case 'status':
      return await handleStatus(taskId);

    case 'detail':
      return await handleDetail(taskId);

    case 'myList':
      return await handleMyList(OPENID, page, pageSize);

    case 'updateStatus':
      return await handleUpdateStatus(taskId, event.status, event.results, event.progress, event.errorMsg);

    case 'like':
      return await handleLike(OPENID, taskId);

    default:
      return { error: 'Unknown action' };
  }
};

// 创建生成任务
async function handleCreate(OPENID, photos, templateId) {
  // 输入校验
  if (!photos || !Array.isArray(photos) || photos.length === 0) {
    return { success: false, error: '请至少上传一张照片' };
  }
  if (!templateId) {
    return { success: false, error: '请选择模板' };
  }

  try {
    // 防重复提交：检查最近30秒内是否有pending/processing的任务
    const recentTasks = await db.collection('tasks')
      .where({
        _openid: OPENID,
        status: _.in(['pending', 'processing']),
        createdAt: _.gte(db.serverDate({ offset: -30000 })),
      })
      .count();

    if (recentTasks.total > 0) {
      return { success: false, error: '请勿重复提交，请等待当前任务完成' };
    }

    const taskData = {
      _openid: OPENID,
      photos,
      templateId,
      status: 'pending',
      results: [],
      errorMsg: '',
      progress: 0,
      createdAt: db.serverDate(),
      updatedAt: db.serverDate(),
    };

    const res = await db.collection('tasks').add({ data: taskData });

    // 触发异步生成（fire-and-forget，不阻塞返回）
    cloud.callFunction({
      name: 'jimeng',
      data: {
        action: 'generate',
        taskId: res._id,
        photos,
        templateId,
      },
    }).catch(e => {
      console.error('调用即梦云函数失败:', e.message);
      // 异步更新任务状态为失败
      db.collection('tasks').doc(res._id).update({
        data: {
          status: 'failed',
          errorMsg: '生成服务暂时不可用，请重试',
          updatedAt: db.serverDate(),
        },
      }).catch(() => {});
    });

    return { taskId: res._id, success: true };
  } catch (e) {
    console.error('创建任务失败:', e.message);
    return { success: false, error: '创建任务失败，请重试' };
  }
}

// 查询任务状态
async function handleStatus(taskId) {
  if (!taskId) return { status: 'unknown', error: '缺少 taskId' };
  try {
    const res = await db.collection('tasks').doc(taskId).get();
    return res.data;
  } catch (e) {
    return { status: 'unknown', error: '任务不存在' };
  }
}

// 获取任务详情
async function handleDetail(taskId) {
  if (!taskId) return null;
  try {
    const res = await db.collection('tasks').doc(taskId).get();
    return res.data;
  } catch (e) {
    return null;
  }
}

// 我的任务列表
async function handleMyList(OPENID, page, pageSize) {
  try {
    const p = page || 1;
    const ps = pageSize || 10;
    const countRes = await db.collection('tasks').where({ _openid: OPENID }).count();
    const res = await db.collection('tasks')
      .where({ _openid: OPENID })
      .orderBy('createdAt', 'desc')
      .skip((p - 1) * ps)
      .limit(ps)
      .get();
    return { data: res.data, total: countRes.total };
  } catch (e) {
    return { data: [], total: 0 };
  }
}

// 更新任务状态
async function handleUpdateStatus(taskId, status, results, progress, errorMsg) {
  if (!taskId) return { success: false, error: '缺少 taskId' };
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
    return { success: true };
  } catch (e) {
    return { success: false, error: e.message };
  }
}

// 点赞
async function handleLike(OPENID, taskId) {
  if (!taskId) return { success: false, error: '缺少 taskId' };
  try {
    // 查看是否已点赞
    const task = await db.collection('tasks').doc(taskId).get();
    const likedBy = task.data.likedBy || [];
    const isLiked = likedBy.includes(OPENID);

    if (isLiked) {
      // 取消点赞
      await db.collection('tasks').doc(taskId).update({
        data: {
          likedBy: _.pull(OPENID),
          likeCount: _.inc(-1),
        },
      });
      return { success: true, liked: false };
    } else {
      // 点赞
      await db.collection('tasks').doc(taskId).update({
        data: {
          likedBy: _.push(OPENID),
          likeCount: _.inc(1),
        },
      });
      return { success: true, liked: true };
    }
  } catch (e) {
    return { success: false, error: e.message };
  }
}
