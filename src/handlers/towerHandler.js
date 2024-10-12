// src/handlers/towerHandler.js

// import { getUserById, updateUserGold } from '../models/userModel.js';
import { getGameAssets } from '../init/assets.js';
import { updateUserTowerData, getAllUserTowers, removeUserTower } from '../models/towerModel.js';
// import { calculateRefundAmount, calculateUpgradeCost } from '../utils/towerCalculator.js';

/** 타워 기본 제공 핸들러 **/
export const InitialTowerHandler = async (userId, payload, socket) => {
  const { towerData, towerId } = payload;
  const towers = getAllUserTowers(userId);

  if (!towerData) {
    return { status: 'fail', message: 'No Data', handlerId: 20 }
  }
  if (towers.length === towerId){
    socket.emit('InitialTower', { status: 'success', message: 'Initial Tower complete', towerData });
    return;
  }
}

/** 유저 타워 정보 업데이트 핸들러 **/
export const userTowerUpdate = async (userId, payload, socket) => {
  const { towerData, index } = payload;

  updateUserTowerData(userId, towerData, index)
}

/** 타워 구매 핸들러 **/
export const handleBuyTower = async (userId, payload, socket) => {
  const { userGold } = payload;
  const { tower } = getGameAssets();

  const towers = getAllUserTowers(userId)
  
  // 타워 개수 확인
  if (towers.length >= 10) {
    socket.emit('BuyTower', { status: 'fail', message: 'tower limit' });
  }
  // 골드 확인
  else if(userGold < tower.data[0].cost) {
    socket.emit('BuyTower', { status: 'fail', message: 'money issue' });
    return
  }
  // 골드 차감
  else if (userGold >= tower.data[0].cost){
    socket.emit('BuyTower', { status: 'success', cost: tower.data[0].cost });
    return;
  }
};

/**
 * 타워 환불 핸들러
 */
export const handleRefundTower = async (userId, payload, io) => {
  const { towers, towerId } = payload;

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

  // return { status: 'success', handlerId: 23, towerData: tower };
};
