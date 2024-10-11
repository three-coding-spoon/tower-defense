// 잡은 몬스터들의 점수를 합산해 검증

import { getMobCount } from '../models/mobCountModel.js';

export const calculateTotalScore = (userId) => {
  const takenMobs = getMobCount(userId);

  const score = takenMobs.reduce((p, n) => p + n, 0);
  console.log('최종 스코어: ', score);
  // 여긴 그냥 계산만 해서 리턴
  // 검즘은 하지 않음
  return score;
};
