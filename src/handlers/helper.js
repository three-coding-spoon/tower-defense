import { removeUser } from '../models/userModel.js';
import { CLIENT_VERSION } from '../constants.js';
import handlerMappings from './handlerMapping.js';
import { getTopHighScore } from '../models/score.model.js';
import { initWaves } from '../models/waveModel.js';

export const handleConnection = async (socket, userId) => {
  console.log(`New user connected: ${userId} with socket ID ${socket.id}`);

  // 웨이브? 생성
  initWaves(userId);

  // 하이 스코어 가져오기
  const highScore = await getHighScore();

  socket.emit('connection', { userId: userId, highScore: highScore ? highScore : 0 });
};

export const handleDisconnect = async (userId) => {
  await removeUser(userId); // 사용자 삭제
  console.log(`User disconnected: ${userId}`);
};

export const handleEvent = async (io, socket, data) => {
  if (!CLIENT_VERSION.includes(data.clientVersion)) {
    console.log(`Client version mismatch: ${data.clientVersion}`);
    socket.emit('response', { status: 'fail', message: 'Client version mismatch' });
    return;
  }

  const handler = handlerMappings[data.handlerId];
  if (!handler) {
    console.log(`Handler not found: ${data.handlerId}`);
    socket.emit('response', { status: 'fail', message: 'Handler not found' });
    return;
  }

  const response = await handler(data.userId, data.payload, io);
  if (response.broadcast) {
    switch (response.handlerId) {
      case 6:
        io.emit('newHighScore', response.data);
        return;
    }
  }

  socket.emit('response', response);
};
