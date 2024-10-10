// src/handlers/broadcastHandler.js

import { getTopHighScore } from '../models/scoreModel.js';

export const broadcastNewHighScore = async (userId, payload, io) => {
  try {
    // 하이스코어 가져오기
    const highScore = await getTopHighScore();

    // 모든 클라이언트에게 새로운 하이스코어를 브로드캐스트
    io.emit('newHighScore', { highScore });

    return { status: 'success', handlerId: 4, broadcast: true };
  } catch (error) {
    console.error(`Error in broadcastNewHighScore: ${error.message}`);
    return { status: 'fail', message: 'Failed to broadcast new high score', handlerId: 4 };
  }
};
