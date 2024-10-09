// src/handlers/towerHandler.js

import { getUserById, updateUserGold } from '../models/userModel.js';
import { getTowerById } from '../init/gameAssets.js';
import { updateUserTowerData, getUserTowerById, removeUserTower } from '../models/towerModel.js';
import { calculateRefundAmount, calculateUpgradeCost } from '../utils/towerCalculator.js';

/**
 * 타워 구입 핸들러
 */
export const handleBuyTower = async (userId, payload, io) => {
  const { towerTypeId } = payload;

  // 유효한 타워 타입인지 확인

  // 유저 정보 가져오기

  // 골드 확인

  // 골드 차감

  // 타워 데이터 생성 및 업데이트

  return { status: 'success', handlerId: 21, towerData };
};

/**
 * 타워 환불 핸들러
 */
export const handleRefundTower = async (userId, payload, io) => {
  const { towerId } = payload;

  // 유저의 타워 조회

  // 환불 금액 계산

  // 골드 추가

  // 타워 제거

  return { status: 'success', handlerId: 22, refundAmount };
};

/**
 * 타워 업그레이드 핸들러
 */
export const handleUpgradeTower = async (userId, payload, io) => {
  const { towerId } = payload;

  // 유저의 타워 조회

  // 업그레이드 비용 계산

  // 골드 확인

  // 골드 차감

  // 타워 레벨 업그레이드

  return { status: 'success', handlerId: 23, towerData: tower };
};
