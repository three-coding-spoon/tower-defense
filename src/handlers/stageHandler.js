// src/handlers/stageHandler.js

import { getStage, setStage } from '../models/stageModel.js';
import { getGameAssets } from '../init/assets.js';
import { addLog } from '../utils/log.js';

/**
 * 스테이지 이동 핸들러
 */
export const moveStageHandler = (userId, payload, socket) => {
  const { currentStage, targetStage, clientTimestamp } = payload;

  // 현재 스테이지 확인
  const currentStages = getStage(userId);
  if (!currentStages.length) {
    return { status: 'fail', message: 'No stages found for user', handlerId: 11 };
  }

  // 페이로드 데이터와 비교
  const latestStage = currentStages[currentStages.length - 1];
  if (latestStage.id !== currentStage) {
    return { status: 'fail', message: 'Current stage mismatch', handlerId: 11 };
  }

  const { stages } = getGameAssets();

  // 목표 스테이지 존재 여부 확인
  const targetStageInfo = stages.find((stage) => stage.id === targetStage);
  if (!targetStageInfo) {
    return { status: 'fail', message: 'Target stage does not exist', handlerId: 11 };
  }

  // 스테이지를 건너뛰진 않는지 확인
  if (targetStage !== currentStage + 1) {
    return { status: 'fail', message: 'Invalid stage progression', handlerId: 11 };
  }

  // 스테이지 업데이트
  const timestamp = Date.now();
  setStage(userId, targetStage, timestamp);
  addLog(userId, 11, targetStage, timestamp);

  socket.emit('moveStage', { status: 'sucess', targetStage, reward: 1000 });

  return;
};
