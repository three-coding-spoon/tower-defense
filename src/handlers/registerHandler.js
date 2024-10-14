import { authValidation } from '../middlewares/authMiddleware.js';
import { getUserByName } from '../models/userModel.js';
import { handleConnection, handleDisconnect, handleEvent } from './helper.js';

const registerHandler = (io) => {
  io.on('connection', async (socket) => {
    // 최초 커넥션을 맺은 이후 발생하는 각종 이벤트를 처리하는 곳

    const token = socket.handshake.auth.token;
    const username = socket.handshake.auth.username;

    const auth = authValidation(token);

    // 토큰 인증 확인 필요
    if (!auth.isVaild) {
      socket.emit('authorization', {
        status: 'fail',
        message: '토큰이 유효하지 않습니다. 재로그인이 필요합니다.',
      });
      return socket.disconnect();
    }

    let user = {};
    if (socket.handshake.auth.username) {
      // 이미 존재가 확인된 사용자만 들어오는 흐름이므로 소켓ID만 지정해 줌
      user = await getUserByName(username);
    } else {
      console.warn('Invaild socket connection request without user name. Disconnecting socket.');
      return socket.disconnect();
    }

    const userId = user.id;
    await handleConnection(socket, userId);

    // 모든 서비스 이벤트 처리
    socket.on('event', (data) => handleEvent(io, socket, data));

    // 접속 해제시 이벤트 처리
    socket.on('disconnect', () => handleDisconnect(socket, user.id));
  });
};

export default registerHandler;
