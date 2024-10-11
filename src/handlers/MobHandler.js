// src/handlers/MobHandler.js

import { addTakenMonsterToMobCount } from '../models/mobCountModel.js';
import { getMobById } from '../init/assets.js';

/**
 * 몹 잡기 핸들러
 */
export const handleKillMob = (userId, payload, io) => {
  // 일단 아이디만 보내는 걸로
  const mobId = payload.monsterId;

  // 몹 존재 여부 확인
  const mob = getMobById(mobId);
  if (!mob) {
    return { status: 'fail', message: 'Invalid mob ID', handlerId: 5 };
  }

  // 몹 카운트에 추가
  addTakenMonsterToMobCount(userId, mobId);

  return { status: 'success', handlerId: 5 };
};
