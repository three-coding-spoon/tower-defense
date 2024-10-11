// src/handlers/broadcastHandler.js

export const broadcastNewHighScore = async (username, io, serverScore) => {
  try {
    // 하이스코어 가져오기
    const highScore = serverScore;

    // 모든 클라이언트에게 새로운 하이스코어를 브로드캐스트
    io.emit('newHighScore', {
      status: 'success',
      message: `${username}님 랭킹 1위 달성!!`,
      highScore,
    });

    return;
  } catch (error) {
    console.error(`Error in broadcastNewHighScore: ${error.message}`);
    io.emit('newHighScore', { status: 'fail', message: 'Error in broadcastNewHighScore.' });
    return;
    // return { status: 'fail', message: 'Failed to broadcast new high score', handlerId: 4 };
  }
};
