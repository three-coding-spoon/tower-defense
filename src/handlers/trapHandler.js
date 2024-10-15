// src/handlers/towerHandler.js

import { getGameAssets } from '../init/assets.js';
import { updateUserTrapData, getAllUserTraps } from '../models/trapModels.js';

/** 유저 트랩 정보 업데이트 핸들러 **/
export const userTrapUpdate = async (userId, payload, socket) => {
  const { trapData, index } = payload;

  updateUserTrapData(userId, trapData, index);
};

/** 트랩 구매 핸들러 **/
export const handleBuyTrap = async (userId, payload, socket) => {
  const { userGold } = payload;
  const { trap } = getGameAssets();

  const traps = getAllUserTraps(userId);

  // 트랩 개수 확인
  if (traps.length >= 10) {
    socket.emit('BuyTrap', { status: 'fail', message: 'Trap limit' });
    return;
  }
  // 골드 확인
  else if (userGold < trap.data[0].cost) {
    socket.emit('BuyTrap', { status: 'fail', message: 'not enough gold' });
    return;
  }
  // 골드 차감
  else if (userGold >= trap.data[0].cost) {
    socket.emit('BuyTrap', { status: 'success', cost: trap.data[0].cost });
    return;
  }
};
