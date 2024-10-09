// src/models/stageModel.js

const stages = new Map();

export const createStage = (userId) => {
  stages.set(userId, []);
};

export const getStage = (userId) => {
  return stages.get(userId) || [];
};

export const setStage = (userId, id, timestamp) => {
  const userStages = stages.get(userId) || [];
  userStages.push({ id, timestamp });
  stages.set(userId, userStages);
};

export const clearStage = (userId) => {
  stages.delete(userId);
};
