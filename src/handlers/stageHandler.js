// src/handlers/stageHandler.js

import { getStage, setStage } from '../models/stageModel.js';
import { getGameAssets } from '../init/gameAssets.js';

/**
 * 스테이지 이동 핸들러
 */
export const moveStageHandler = (userId, payload) => {
  const { currentStage, targetStage } = payload;

  // 현재 스테이지 확인
  const currentStages = getStage(userId);
  if (!currentStages.length) {
    return { status: 'fail', message: 'No stages found for user', handlerId: 11 };
  }

  const latestStage = currentStages[currentStages.length - 1];
  if (latestStage.id !== currentStage) {
    return { status: 'fail', message: 'Current stage mismatch', handlerId: 11 };
  }

  // 목표 스테이지 존재 여부 확인
  const { stages } = getGameAssets();
  const targetStageInfo = stages.find((stage) => stage.id === targetStage);
  if (!targetStageInfo) {
    return { status: 'fail', message: 'Target stage does not exist', handlerId: 11 };
  }

  // 스테이지 업데이트
  const timestamp = Date.now();
  setStage(userId, targetStage, timestamp);

  return { status: 'success', handlerId: 11 };
};
