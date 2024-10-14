// src/handlers/towerHandler.js

// import { getUserById, updateUserGold } from '../models/userModel.js';
import { getGameAssets } from '../init/assets.js';
import { updateUserTowerData, getAllUserTowers, removeUserTower } from '../models/towerModel.js';
// import { calculateRefundAmount, calculateUpgradeCost } from '../utils/towerCalculator.js';

/** 타워 기본 제공 핸들러 **/
export const InitialTowerHandler = async (userId, payload, socket) => {
  const { towerPos, towerId } = payload;
  const towers = getAllUserTowers(userId);

  if (!towerPos) {
    socket.emit('InitialTower', { status: 'fail', message: 'No Data' });
    return;
  }
  if (towers.length === towerId) {
    socket.emit('InitialTower', { status: 'success', message: 'Initial Tower complete', towerPos });
    return;
  }
};

/** 유저 타워 정보 업데이트 핸들러 **/
export const userTowerUpdate = async (userId, payload, socket) => {
  const { towerData, index } = payload;

  updateUserTowerData(userId, towerData, index);
};

/** 타워 구매 핸들러 **/
export const handleBuyTower = async (userId, payload, socket) => {
  const { userGold } = payload;
  const { tower } = getGameAssets();

  const towers = getAllUserTowers(userId);

  // 타워 개수 확인
  if (towers.length >= 10) {
    socket.emit('BuyTower', { status: 'fail', message: 'tower limit' });
    return;
  }
  // 골드 확인
  else if (userGold < tower.data[0].cost) {
    socket.emit('BuyTower', { status: 'fail', message: 'not enough gold' });
    return;
  }
  // 골드 차감
  else if (userGold >= tower.data[0].cost) {
    socket.emit('BuyTower', { status: 'success', cost: tower.data[0].cost });
    return;
  }
};

/** 타워 판매 핸들러 **/
export const handleRefundTower = async (userId, payload, socket) => {
  const { tower, towerIndex } = payload;

  // 유저의 타워 조회
  const towers = getAllUserTowers(userId);
  const index = towerIndex;
  // 판매 금액 계산
  const refundAmount = tower.price / 2;
  // 서버 데이터에서 타워 제거
  if (towers.length === 0) {
    socket.emit('RefundTower', { status: 'fail', message: 'No towers on the field' });
    return;
  }
  if (towers[index].x === tower.x && towers[index].y === tower.y) {
    removeUserTower(userId, index);
    socket.emit('RefundTower', { status: 'success', index, refundAmount });
    return;
  } else {
    socket.emit('RefundTower', { status: 'fail', message: 'tower mismatch' });
    return;
  }
};

/** 타워 강화 핸들러 **/
export const handleUpgradeTower = async (userId, payload, socket) => {
  const { userGold, tower, towerIndex } = payload;

  // 유저의 타워 조회
  const towers = getAllUserTowers(userId);
  const index = towerIndex;
  if (
    towers[index].x !== tower.x &&
    towers[index].y !== tower.y &&
    towers[index].level !== towers.level
  ) {
    socket.emit('upgradeTower', { status: 'fail', message: 'Tower data corrupted' });
    return;
  }
  // 강화 비용 계산
  const cost = tower.cost * (tower.level * 1.5);
  if (tower.level === 3) {
    socket.emit('upgradeTower', { status: 'fail', message: 'max level' });
    return;
  }
  // 골드 확인
  else if (userGold < cost) {
    socket.emit('upgradeTower', { status: 'fail', message: 'not enough gold' });
    return;
  } else if (userGold >= cost) {
    socket.emit('upgradeTower', { status: 'success', message: 'Upgraded tower', index, cost });
    return;
  }
};
