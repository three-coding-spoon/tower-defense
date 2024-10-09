// src/models/towerModel.js

const userTowers = new Map();

export const updateUserTowerData = (userId, towerData) => {
  const towers = userTowers.get(userId) || [];
  const index = towers.findIndex((t) => t.id === towerData.id);

  if (index >= 0) {
    towers[index] = towerData;
  } else {
    towers.push(towerData);
  }

  userTowers.set(userId, towers);
};

export const getUserTowerById = (userId, towerId) => {
  const towers = userTowers.get(userId) || [];
  return towers.find((t) => t.id === towerId) || null;
};

export const removeUserTower = (userId, towerId) => {
  let towers = userTowers.get(userId) || [];
  towers = towers.filter((t) => t.id !== towerId);
  userTowers.set(userId, towers);
};
