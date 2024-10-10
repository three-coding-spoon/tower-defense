// src/utils/towerUtils.js

export const calculateRefundAmount = (tower) => {
  // 예시: 구매 가격의 50% 환불
  const towerInfo = getTowerById(tower.typeId);
  return Math.floor(towerInfo.price * 0.5);
};

export const calculateUpgradeCost = (level) => {
  // 예시: 기본 업그레이드 비용 * 레벨
  const baseUpgradeCost = 100;
  return baseUpgradeCost * level;
};
