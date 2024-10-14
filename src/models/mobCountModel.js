// src/models/mobCountModel.js

const mobCount = new Map();
const goldenGoblinSpawned = new Map(); // 황고 스폰 여부 추적

export const initMobCounts = (userId) => {
  mobCount.set(userId, new Map());
  goldenGoblinSpawned.set(userId, new Map());
};

export const addTakenMonsterToMobCount = (userId, monsterId) => {
  const userMobCount = mobCount.get(userId);

  if (userMobCount.has(monsterId)) {
    userMobCount.set(monsterId, userMobCount.get(monsterId) + 1);
  } else {
    userMobCount.set(monsterId, 1);
  }
};

export const getMobCount = (userId) => {
  return mobCount.get(userId) || new Map();
};

export const clearMobCounts = (userId) => {
  mobCount.delete(userId);
  goldenGoblinSpawned.delete(userId); // 클리어 시 추가
};

// 황고 스폰 여부 확인
export const hasSpawnedGoldenGoblin = (userId, stageId) => {
  const userGoldenGoblin = goldenGoblinSpawned.get(userId);
  if (userGoldenGoblin && userGoldenGoblin.get(stageId)) {
    return true;
  }
  return false;
};

// 황고 스폰 플래그 설정
export const setSpawnedGoldenGoblin = (userId, stageId) => {
  const userGoldenGoblin = goldenGoblinSpawned.get(userId);
  if (userGoldenGoblin) {
    userGoldenGoblin.set(stageId, true);
  } else {
    goldenGoblinSpawned.set(userId, new Map([[stageId, true]]));
  }
};
