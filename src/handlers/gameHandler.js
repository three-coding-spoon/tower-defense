// src/handlers/gameHandler.js

import { getGameAssets } from '../init/assets.js';
import { calculateTotalScore } from '../utils/scoreCalculation.js';
import { getMyHighScore, updateHighScore } from '../models/scoreModel.js';
import { initMobCounts, getMobCount, clearMobCounts } from '../models/mobCountModel.js';
import { clearStage, createStage, getStage } from '../models/stageModel.js';
import { broadcastNewHighScore } from './broadcastHandler.js';
import { initGameStateInfo } from '../../constants.js';
import { getTopHighScore } from '../models/scoreModel.js';
import { getUserById } from '../models/userModel.js';
import { initTowers, getAllUserTowers } from '../models/towerModel.js';
import { addLog } from '../utils/log.js';

export const gameStart = (userId, payload, socket, io) => {
  try {
    const assets = getGameAssets();
    // 게임 에셋을 클라이언트로 전송
    if (assets === 'undefined' || assets === null) {
      socket.emit('gameAssets', { status: 'fail', message: '에셋을 불러오지 못했습니다.' });
      addLog(userId, 2, `${userId}번 유저의 애샛 로드에 실패했습니다.`);
    }
    socket.emit('gameAssets', assets);

    // 유저의 몹 카운트와 스테이지, 타워 정보 초기화
    initMobCounts(userId);
    createStage(userId);
    initTowers(userId);

    // 유저의 몹 카운트와 스테이지, 타워 정보가 초기화가 되었는지 확인
    const userMobCount = getMobCount(userId);
    const userStage = getStage(userId);
    const userTower = getAllUserTowers(userId);
    if (!userMobCount || !userStage || !userTower) {
      socket.emit('gameStart', { status: 'fail', message: '게임 초기화에 실패했습니다.' });
      addLog(userId, 2, `${userId}번 유저의 게임 초기화에 실패했습니다.`);
    }

    socket.emit('gameStart', {
      status: 'success',
      message: '게임 시작에 성공했습니다.',
      initGameStateInfo,
    });
    addLog(userId, 2, `${userId}번 유저가 게임을 시작했습니다.`);
    return;
  } catch (err) {
    socket.emit('gameStart', {
      status: 'fail',
      message: '게임 시작에 실패했습니다. ' + err.message,
    });
    addLog(userId, 2, `${userId}번 유저의 게임 시작에 실패했습니다.`);
    return;
  }
};

export const gameEnd = async (userId, payload, socket, io) => {
  try {
    const clientScore = payload.clientScore;
    const serverScore = calculateTotalScore(userId);
    if (serverScore === -1) {
      socket.emit('gameEnd', { status: 'fail', message: '부정행위 검출' });
      addLog(userId, 3, `${userId}번 유저의 스코어 검증 중 부정행위가 발견되었습니다.`);
    }

    console.log(clientScore, serverScore);

    if (clientScore !== serverScore) {
      socket.emit('gameEnd', { status: 'fail', message: 'Score mismatch detected.' });
      addLog(
        userId,
        3,
        `${userId}번 유저의 스코어가 일치하지 않습니다. 서버: ${serverScore}, 클라이언트: ${clientScore}`,
      );
      return;
    }

    // 내 최고점수 확인 후 갱신 요청
    const myHighScore = await getMyHighScore(userId);
    console.log('myHighScore: ', myHighScore);
    if (myHighScore < serverScore) {
      await updateHighScore(userId, serverScore);
      socket.emit('newMyHighScore', {
        status: 'success',
        message: '내 최고 점수를 갱신하였습니다!',
      });
      console.log('내 최고 점수를 갱신하여 점수를 새로 등록합니다. ' + serverScore);
    }

    const user = await getUserById(userId);

    // 하이스코어 갱신 여부 확인
    const highScore = await getTopHighScore();
    if (serverScore >= highScore) {
      // 브로드캐스트 핸들러 호출
      await broadcastNewHighScore(user.username, io, serverScore);
      addLog(userId, 3, `${userId}번 유저가 하이 스코어 갱신. 최종 스코어: ${serverScore}`);
    }

    socket.emit('gameEnd', { status: 'success', message: '게임이 종료되었습니다.' });
    addLog(userId, 3, `${userId}번 유저의 게임이 종료되었습니다. 최종 스코어: ${serverScore}`);

    // 유저 게임 데이터 초기화
    clearMobCounts(userId);
    clearStage(userId);
    return;
  } catch (error) {
    socket.emit('gameEnd', {
      status: 'fail',
      message: '게임이 비정상적으로 종료되었습니다.' + error.message,
    });
    addLog(userId, 3, `${userId}번 유저의 게임이 비정상적으로 종료되었습니다.`);
    return;
  }
};
