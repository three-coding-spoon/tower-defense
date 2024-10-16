// src/models/towerModel.js

const userTowers = new Map();

export const initTowers = (userId) => {
  userTowers.set(userId, []);
};

export const updateUserTowerData = (userId, towerData, index = null) => {
  const towers = userTowers.get(userId) || [];

  if (index !== null && index >= 0 && index < towers.length) {
    // 기존 타워 업데이트
    towers[index] = { ...towers[index], ...towerData };
    userTowers.set(userId, towers);
    return towers[index];
  } else {
    // 새로운 타워를 추가
    towers.push(towerData);
    userTowers.set(userId, towers);
    return towerData;
  }
};

export const getUserTowerByIndex = (userId, index) => {
  const towers = userTowers.get(userId) || [];
  if (index >= 0 && index < towers.length) {
    return towers[index];
  }
  return null;
};

export const removeUserTower = (userId, index) => {
  const towers = userTowers.get(userId) || [];
  if (index >= 0 && index < towers.length) {
    towers.splice(index, 1);
  }
};

export const getAllUserTowers = (userId) => {
  return userTowers.get(userId) || [];
};

export const clearTowers = (userId) => {
  userTowers.clear(userId);
};
