import { getTowers } from '../models/towerModel.js';
import towerInfo from '../assets/tower.json' with { type: 'json'}

/**
 * 타워 구입 핸들러
 */
export const handleBuyTower = async (userId, payload) => {
  const { userGold } = payload;
  const towers = getTowers(userId);

  // 유효한 타워 개수인지 확인
  if(towers.length >= 10){
    return { status: 'fail', message: '타워를 10개 이상 구매할 수 없습니다.' };
  }

    // 골드 차감
  if(userGold < towerInfo.data[0].cost){
    socket.emit('towerPurchase', { status: 'fail', message: '잔액 부족' })
  }

  userGold -= towerInfo.data[0].cost

  return { status: 'success', handlerId: 21 };
};

/**
 * 타워 환불 핸들러
 */
export const handleRefundTower = async (userId, payload) => {
  const towers = getTowers(userId);

  //타워의 데이터 찾기 현재 때린 타워의 ID를 기반으로 저장된 타워를 찾는다.
  const tower = towers.find((data) => data.id === payload.towerId);

  //해당 Id의 타워가 존재하는지 체크
  if (!tower) {
    return { status: 'fail', message: 'There is No Tower' };
  }

  // 해당 위치의 타워가 존재하는지 체크
  if (tower.position.x != payload.towerpos.x && tower.position.y != payload.towerpos.y) {
    return { status: 'fail', message: 'Position is Not Matching' };
  }

  const userGameState = getUserById(userId);

  userGameState.userGold += Math.floor(userGameState.towerCost * (1 / 2));

  // 업데이트된 게임 상태를 클라이언트에 전송
  socket.emit('updateGameState', {
    userGold: userGameState.userGold,
  });

  return { status: 'success', message: '타워 환불 완료' };
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
