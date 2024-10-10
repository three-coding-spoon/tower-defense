// src/handlers/gameHandler.js

import { getGameAssets } from '../init/assets.js';
import { calculateTotalScore } from '../utils/scoreCalculation.js';
import { updateHighScore } from '../models/scoreModel.js';
import { initMobCounts, clearMobCounts, getMobCount } from '../models/mobCountModel.js';
import { clearStage, getStage } from '../models/stageModel.js';
import { broadcastNewHighScore } from './broadcastHandler.js';

export const gameStart = (userId, payload, socket, io) => {
  try {
    const assets = getGameAssets();
    // 게임 에셋을 클라이언트로 전송
    socket.to(userId).emit('gameAssets', assets);

    // 유저의 몹 카운트와 스테이지 정보 초기화
    initMobCounts(userId);
    clearStage(userId);

    // 유저의 몹 카운트와 스테이지 정보가 초기화가 되었는지 확인
    const userMobCount = getMobCount(userId);
    const userStage = getStage(userId);
    if (userMobCount.length > 0 || userStage.length > 0) {
      socket.emit('gameStart', { status: 'fail', message: '게임 초기화에 실패했습니다.' });
    }

    socket.emit('gameStart', { status: 'success', message: '게임 시작에 성공했습니다.' });
    return;
  } catch (err) {
    socket.emit('gameStart', {
      status: 'fail',
      message: '게임 시작에 실패했습니다. ' + err.message,
    });
    return;
  }
};

export const gameEnd = async (userId, payload, socket, io) => {
  try {
    const { clientScore } = payload;
    const serverScore = calculateTotalScore(userId);

    if (clientScore !== serverScore) {
      socket.emit('gameEnd', { status: 'fail', message: 'Score mismatch detected.' });
      return;
    }

    await updateHighScore(userId, serverScore);

    // 하이스코어 갱신 여부 확인
    const highScore = await getTopHighScore();
    if (serverScore >= highScore) {
      // 브로드캐스트 핸들러 호출
      const broadcastResult = await broadcastNewHighScore(userId, {}, io);
    }

    // 게임 종료 후 유저 데이터 초기화
    // [수빈] 시작할 때 초기화하는데 한번 더 초기화할 필요 없다고 판단.
    // clearMobCounts(userId);
    // clearStage(userId);

    socket.emit('gameEnd', { status: 'success', message: '게임이 종료되었습니다.' });
    return;
  } catch (error) {
    socket.emit('gameEnd', {
      status: 'fail',
      message: '게임이 비정상적으로 종료되었습니다.' + error.message,
    });
    return;
  }
};
