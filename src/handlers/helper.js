// src/handlers/helper.js

import { removeUser } from '../models/userModel.js';
import { CLIENT_VERSION } from '../../constants.js';
import handlerMappings from './handlerMapping.js';
import { getTopHighScore } from '../models/scoreModel.js';
import { initMobCounts } from '../models/mobCountModel.js';
import { createStage } from '../models/stageModel.js';

export const handleConnection = async (socket, userId) => {
  console.log(`New user connected: ${userId} with socket ID ${socket.id}`);

  // 사용자별 몹 카운트 및 스테이지 초기화
  initMobCounts(userId);
  createStage(userId);

  // 하이 스코어 가져오기
  const highScore = await getTopHighScore();

  // 클라이언트로 연결 이벤트 전송
  socket.emit('connection', { userId: userId, highScore: highScore || 0 });
};

export const handleDisconnect = async (socket, userId) => {
  // 사용자 정리

  console.log(`User disconnected: ${userId}`);
};

export const handleEvent = async (io, socket, data) => {
  // 클라이언트 버전 검증
  if (!CLIENT_VERSION.includes(data.clientVersion)) {
    console.log(`Client version mismatch: ${data.clientVersion}`);
    socket.emit('response', { status: 'fail', message: 'Client version mismatch' });
    return;
  }

  // 핸들러 호출
  const handler = handlerMappings[data.handlerId];
  if (!handler) {
    console.log(`Handler not found: ${data.handlerId}`);
    socket.emit('response', { status: 'fail', message: 'Handler not found' });
    return;
  }

  // 핸들러 실행
  const response = await handler(data.userId, data.payload, socket, io);

  // 브로드캐스트 처리
  try {
    // response에 broadcast가 있는지 먼저 확인
    if (response && 'broadcast' in response) {
      if (response.broadcast) {
        switch (response.handlerId) {
          case 4: // 하이 스코어 갱신
            io.emit('newHighScore', response.data);
            return;
        }
      } else {
        console.log(`HandlerId ${response.handlerId} is not a broadcast response`);
      }
    }
  } catch (err) {
    console.error(err.message);
  }

  // finally {
  //   // 응답 전송
  //   socket.emit('response', response);
  // }
};
