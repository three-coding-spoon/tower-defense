// src/handlers/stageHandler.js

import { getStage, setStage } from '../models/stageModel.js';
import { getGameAssets } from '../init/assets.js';
import { addLog } from '../utils/log.js';

// 스테이지 이동 핸들러
export const moveStageHandler = (userId, payload, socket) => {
  const { currentStage, targetStage } = payload;

  // 현재 스테이지 확인
  const currentStages = getStage(userId);
  if (!currentStages.length) {
    socket.emit('moveStage', {
      status: 'fail',
      message: 'No stages found for user',
    });
    return;
  }

  // 페이로드 데이터와 비교
  const latestStage = currentStages[currentStages.length - 1];
  if (latestStage.stageId !== currentStage) {
    socket.emit('moveStage', {
      status: 'fail',
      message: 'Current stage mismatch',
    });
    return;
  }

  const { wave } = getGameAssets();

  // 목표 스테이지 존재 여부 확인
  const targetStageInfo = wave.data.find((stage) => stage.id - 999 === targetStage);
  if (!targetStageInfo) {
    socket.emit('moveStage', {
      status: 'fail',
      message: 'Target stage does not exist',
    });
    return;
  }

  // 스테이지를 건너뛰지 않는지 확인
  if (targetStage !== currentStage + 1) {
    socket.emit('moveStage', {
      status: 'fail',
      message: 'Invalid stage progression',
    });
    return;
  }

  // 스테이지 업데이트
  const timestamp = Date.now();
  setStage(userId, targetStage, timestamp);
  addLog(userId, 11, `${userId}번 유저가 ${targetStage}번 스테이지로 이동했습니다.`);

  // 결과 쏴줌
  socket.emit('moveStage', {
    status: 'success',
    targetStage,
    reward: 1000,
  });

  return;
};
