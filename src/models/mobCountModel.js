// src/models/mobCountModel.js

const mobCount = new Map();

export const initMobCounts = (userId) => {
  mobCount.set(userId, new Map());
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
};
