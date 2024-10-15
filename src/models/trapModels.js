// src/models/trapModel.js

const userTraps = new Map();

export const initTraps = (userId) => {
  userTraps.set(userId, []);
};

export const updateUserTrapData = (userId, trapData, index = null) => {
  const traps = userTraps.get(userId) || [];

  if (index !== null && index >= 0 && index < traps.length) {
    // 기존 타워 업데이트
    traps[index] = { ...traps[index], ...trapData };
    userTraps.set(userId, traps);
    return traps[index];
  } else {
    // 새로운 타워를 추가
    traps.push(trapData);
    userTraps.set(userId, traps);
    return trapData;
  }
};

export const getUserTrapByIndex = (userId, index) => {
  const traps = userTraps.get(userId) || [];
  if (index >= 0 && index < traps.length) {
    return traps[index];
  }
  return null;
};

export const getAllUserTraps = (userId) => {
  return userTraps.get(userId) || [];
};
