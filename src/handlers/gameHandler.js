// src/handlers/gameHandler.js

import { getGameAssets } from '../init/assets.js';
import { calculateTotalScore } from '../utils/scoreCalculation.js';
import { getMyHighScore, updateHighScore } from '../models/scoreModel.js';
import { initMobCounts, clearMobCounts, getMobCount } from '../models/mobCountModel.js';
import { clearStage, getStage } from '../models/stageModel.js';
import { broadcastNewHighScore } from './broadcastHandler.js';
import { initGameStateInfo } from '../../constants.js';
import { getTopHighScore } from '../models/scoreModel.js';
import { getUserById } from '../models/userModel.js';

export const gameStart = (userId, payload, socket, io) => {
  try {
    const assets = getGameAssets();
    // 게임 에셋을 클라이언트로 전송
    if (assets === 'undefined' || assets === null) {
      socket.emit('gameAssets', { status: 'fail', message: '에셋을 불러오지 못했습니다.' });
    }
    socket.emit('gameAssets', assets);

    // 유저의 몹 카운트와 스테이지 정보 초기화
    initMobCounts(userId);
    clearStage(userId);

    // 유저의 몹 카운트와 스테이지 정보가 초기화가 되었는지 확인
    const userMobCount = getMobCount(userId);
    const userStage = getStage(userId);
    if (userMobCount.length > 0 || userStage.length > 0) {
      socket.emit('gameStart', { status: 'fail', message: '게임 초기화에 실패했습니다.' });
    }

    socket.emit('gameStart', {
      status: 'success',
      message: '게임 시작에 성공했습니다.',
      initGameStateInfo,
    });
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
    const clientScore = payload.clientScore;
    const serverScore = calculateTotalScore(userId);

    console.log(clientScore, serverScore);

    if (clientScore !== serverScore) {
      socket.emit('gameEnd', { status: 'fail', message: 'Score mismatch detected.' });
      return;
    }

    // 내 최고점수 확인 후 갱신 요청
    const myHighScore = await getMyHighScore(userId);
    console.log('myHighScore: ', myHighScore);
    if (myHighScore < serverScore) {
      await updateHighScore(userId, serverScore);
      console.log('내 최고 점수를 갱신하여 점수를 새로 등록합니다. ' + serverScore);
    }

    const user = getUserById(userId);
    console.log(user);

    // 하이스코어 갱신 여부 확인
    const highScore = await getTopHighScore();

    if (serverScore >= highScore) {
      // 브로드캐스트 핸들러 호출
      await broadcastNewHighScore(user.username, io, serverScore);
    }

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
