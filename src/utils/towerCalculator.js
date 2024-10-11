// src/utils/towerCalculator.js

// import { v4 as uuidv4 } from 'uuid';
import { getUserTowerByIndex } from '../models/towerModel.js'

const BASE_UPGRADE_COST = 100;

// 타워 환불 금액 계산
export const calculateRefundAmount = (tower) => {
  // 예시: 구매 가격의 50% 환불
  const towerInfo = getUserTowerByIndex(tower.typeId);
  if (!towerInfo) {
    console.warn(`존재하지 않는 타워 타입: ${tower.typeId}`);
    return 0;
  }
  return Math.floor(towerInfo.cost * 0.5);
};

// 타워 업그레이드 비용 계산
export const calculateUpgradeCost = (level) => {
  // 예시: 기본 업그레이드 비용 * 레벨
  return BASE_UPGRADE_COST * level;
};
