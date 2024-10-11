// src/models/stageModel.js

// userId는 고유하기 때문에 Key로써 사용 가능
// 그 값으로는 스테이지 ID와 스테이지 이동이 일어난 타임스탬프를 가짐
const stages = new Map();

export const createStage = (userId) => {
  stages.set(userId, []); // 배열로 초기화
  setStage(userId, 1, Date.now());
};

export const getStage = (userId) => {
  return stages.get(userId) || [];
};

export const setStage = (userId, stageId, timestamp) => {
  const userStages = stages.get(userId) || [];
  userStages.push({ stageId, timestamp }); // 배열에 추가
  stages.set(userId, userStages);
};

export const clearStage = (userId) => {
  stages.delete(userId);
};