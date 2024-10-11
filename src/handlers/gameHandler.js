// src/handlers/gameHandler.js

import { getGameAssets } from '../init/assets.js';
import { calculateTotalScore } from '../utils/scoreCalculation.js';
import { updateHighScore } from '../models/scoreModel.js';
import { initMobCounts, clearMobCounts } from '../models/mobCountModel.js';
import { clearStage } from '../models/stageModel.js';
import { broadcastNewHighScore } from './broadcastHandler.js';

export const gameStart = (userId, payload, io) => {
  try {
    const assets = getGameAssets();
    // 게임 에셋을 클라이언트로 전송
    io.to(userId).emit('gameAssets', assets);

    // 유저의 몹 카운트와 스테이지 정보 초기화
    initMobCounts(userId);
    clearStage(userId);

    return { status: 'success', handlerId: 2 };
  } catch (error) {
    console.error(`Error in gameStart: ${error.message}`);
    return { status: 'fail', message: 'Failed to start game', handlerId: 2 };
  }
};

export const gameEnd = async (userId, payload, io) => {
  try {
    const { clientScore } = payload;
    const serverScore = calculateTotalScore(userId);

    if (clientScore !== serverScore) {
      return { status: 'fail', message: 'Score mismatch detected', handlerId: 3 };
    }

    await updateHighScore(userId, serverScore);

    // 하이스코어 갱신 여부 확인
    const highScore = await getTopHighScore();
    if (serverScore >= highScore) {
      // 브로드캐스트 핸들러 호출
      const broadcastResult = await broadcastNewHighScore(userId, io);
    }

    // 게임 종료 후 유저 데이터 초기화
    clearMobCounts(userId);
    clearStage(userId);

    return { status: 'success', handlerId: 3, score: serverScore };
  } catch (error) {
    console.error(`Error in gameEnd: ${error.message}`);
    return { status: 'fail', message: 'Failed to end game', handlerId: 3 };
  }
};
