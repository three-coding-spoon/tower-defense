// src/handlers/MobHandler.js

import { addTakenMonsterToMobCount } from '../models/mobCountModel.js';
import { getMobById } from '../init/gameAssets.js';

/**
 * 몹 잡기 핸들러
 */
export const handleKillMob = (userId, payload, io) => {
  const { mobId } = payload;

  // 몹 존재 여부 확인
  const mob = getMobById(mobId);
  if (!mob) {
    return { status: 'fail', message: 'Invalid mob ID', handlerId: 5 };
  }

  // 몹 카운트에 추가
  addTakenMonsterToMobCount(userId, mobId);

  return { status: 'success', handlerId: 5 };
};
