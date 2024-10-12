// src/handlers/MobHandler.js

import { addTakenMonsterToMobCount } from '../models/mobCountModel.js';
import { getGameAssets, getMobById } from '../init/assets.js';
import { getStage } from '../models/stageModel.js';

/**
 * 몹 잡기 핸들러
 */
export const handleKillMob = (userId, payload, socket) => {
  const mobId = payload.monsterId + 100;
  const { monster_unlock } = getGameAssets();

  // 몹 존재 여부 확인
  const mob = getMobById(mobId);
  if (!mob) {
    console.log('존재 확인 불가');
    socket.emit('addMonsterCount', { status: 'fail', message: 'Invalid mob ID' });
    return;
  }

  // 유저의 현재 stage 정보 조회
  const currentStages = getStage(userId);
  if (!currentStages.length) {
    console.log('스테이지 정보 조회 불가');
    socket.emit('addMonsterCount', { status: 'fail', message: 'No stages found for user' });
    return;
  }
  const currentStage = currentStages[currentStages.length - 1].stageId + 999;

  // currentStage가 monster_unlock의 wave_id에 포함되는지 확인
  const stageData = monster_unlock.data.find((stage) => stage.wave_id === currentStage);

  if (!stageData) {
    socket.emit('addMonsterCount', { status: 'fail', message: 'Invalid stage' });
    return;
  }

  const allowedMonsters = stageData.monster_id;

  // 현재 stage에서 나올 수 있는 몬스터인지 검증
  if (!allowedMonsters.includes(mobId - 100)) {
    console.log('몬스터 스테이지 검증 실패');
    socket.emit('addMonsterCount', {
      status: 'fail',
      message: 'Monster not allowed in current stage',
    });
    return;
  }

  // 몹 카운트에 추가
  addTakenMonsterToMobCount(userId, mobId);

  socket.emit('addMonsterCount', { status: 'success' });

  return;
};
