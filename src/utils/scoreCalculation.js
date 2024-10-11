// src/utils/scoreCalculation.js

// 잡은 몬스터들의 점수를 합산해 검증
export const calculateTotalScore = (mobCount) => {
  let totalScore = 0;

  for (const [monsterId, count] of mobCount.entries()) {
    const monster = monsterMap.get(monsterId);
    if (monster) {
      totalScore += monster.score * count;
    } else {
      console.warn(`존재하지 않는 몬스터 ID: ${monsterId}`);
      return -1; // 부정행위로 판단할 수 있기에 -1 리턴
    }
  }

  return totalScore;
};
