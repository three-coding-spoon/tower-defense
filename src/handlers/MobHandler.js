// src/handlers/MobHandler.js

import { addTakenMonsterToMobCount, getMobCount } from '../models/mobCountModel.js';
import { getGameAssets, getMobById } from '../init/assets.js';
import { getStage } from '../models/stageModel.js';

/**
 * 몹 잡기 핸들러
 */

export const handleKillMob = (userId, payload, socket) => {
  const mobId = payload.monsterId;
  const { monsterUnlock } = getGameAssets()

  // 몹 존재 여부 확인
  const mob = getMobById(mobId);
  if (!mob) {
    return { status: 'fail', message: 'Invalid mob ID', handlerId: 5 };
  }

  // 유저의 현재 스테이지 정보 조회
  const currentStages = getStage(userId)
  if (!currentStages.length) {
    return { status: 'fail', message: 'No stages found for user', handlerId: 5 };
  }
  const currentStage = currentStages[currentStages.length - 1].stageId;

  // 현재 스테이지에서 나올 수 있는 몬스터인지 검증
  const allowedMonster = monsterUnlock.data.find((stage) => stage.wave_id === currentStage).monster_id;
  if (!allowedMonster.includes(mobId)) {
    return { status: 'fail', message: 'Monster not allowed in current stage' };
  }

  const currentMobCount = getMobCount(userId)
  console.log(currentMobCount)

  // 몹 카운트에 추가
  addTakenMonsterToMobCount(userId, mobId);


  console.log(currentMobCount)

  socket.emit('killMob', { status: 'sucess', reward: 50 });

  return { status: 'success', handlerId: 5 };
};
