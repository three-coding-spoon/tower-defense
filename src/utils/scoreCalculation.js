// src/utils/scoreCalculation.js

import { getGameAssets } from '../init/assets.js';
import { getMobCount } from '../models/mobCountModel.js';

// 잡은 몬스터들의 점수를 합산해 검증
export const calculateTotalScore = (userId) => {
  const monsterScores = new Map();
  const gameAssets = getGameAssets();
  for (let i in gameAssets.monster.data) {
    monsterScores.set(gameAssets.monster.data[i].id, gameAssets.monster.data[i].score);
  }

  let totalScore = 0;

  const mobCount = getMobCount(userId);

  for (const [monsterId, count] of mobCount.entries()) {
    const monsterScore = monsterScores.get(monsterId);
    if (monsterScore) {
      totalScore += monsterScore * count;
    } else {
      console.warn(`존재하지 않는 몬스터 ID: ${monsterId}`);
      return -1; // 부정행위로 판단할 수 있기에 -1 리턴
    }
  }

  return totalScore;
};
