// src/utils/scoreCalculation.js

import { getGameAssets } from '../init/assets.js';
import { getMobCount, hasSpawnedGoldenGoblin } from '../models/mobCountModel.js';
import { getStage } from '../models/stageModel.js';

// 잡은 몬스터들의 점수를 합산해 검증
export const calculateTotalScore = (userId) => {
  const monsterScores = new Map();
  const gameAssets = getGameAssets();

  // 각 몬스터의 ID와 점수 저장
  for (let i in gameAssets.monster.data) {
    monsterScores.set(gameAssets.monster.data[i].id, gameAssets.monster.data[i].score);
  }

  let totalScore = 0;

  // 잡은 몬스터 기록 가져오기
  const mobCount = getMobCount(userId);
  const currentStages = getStage(userId);

  if (!currentStages.length) {
    console.warn('스테이지 정보가 없습니다.');
    return -1; // 부정행위로 판단
  }

  // 스테이지별로 황고 스폰 여부 및 횟수 확인
  for (const [monsterId, count] of mobCount.entries()) {
    const monsterScore = monsterScores.get(monsterId);
    if (monsterScore) {
      if (monsterId === 105) {
        // 황금 고블린 ID
        // 현재 각 스테이지 당 단 하나만 카운트
        const stages = currentStages.map((stage) => stage.stageId + 999);
        let goldenGoblinCount = 0;
        stages.forEach((stageId) => {
          if (hasSpawnedGoldenGoblin(userId, stageId)) {
            goldenGoblinCount += 1; // 스폰한 스테이지의 수를 센다
          }
        });

        // 기록된 카운트가 스폰한 스테이지의 수보다 높다면 부정행위로 볼 수 있음
        if (count > goldenGoblinCount) {
          console.warn(
            `황금 고블린의 수가 스테이지 당 하나를 초과합니다. 현재: ${count}, 허용치: ${goldenGoblinCount}`,
          );
          return -1; // 부정행위로 판단
        }
        totalScore += monsterScore * count;
      } else {
        totalScore += monsterScore * count;
      }
    } else {
      console.warn(`존재하지 않는 몬스터 ID: ${monsterId}`);
      return -1; // 부정행위로 판단할 수 있기에 -1 리턴
    }
  }

  return totalScore;
};
