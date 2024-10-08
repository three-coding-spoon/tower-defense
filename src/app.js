import express from 'express';
import { createServer } from 'http';
import initSocket from './init/socket.js';
import { loadGameAssets } from './init/assets.js';

const app = express();

const server = createServer(app);

const PORT = 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static('public'));
initSocket(server);

server.listen(PORT, async () => {
  console.log(`Server is ruuning on port ${PORT}`);

  /** 유저관리
   * UUID : 유저의 식별자 + 접속한 기기 정보 등이 담겨있는 고유 번호 - 유저 특정 가능
   * socketId : 유저와 연결된 소켓의 아이디. 고유하지 않음 (재접속 시 변동) - 유저 특정 불가능
   */

  /** 서버에 데이터 파일 로드
   * 서버가 실행이 된 다음 필요한 파일을 읽어야 함.
   */
  try {
    const assets = await loadGameAssets();
    console.log(assets);
    console.log('Assets loaded successfully.');
  } catch (e) {
    console.log('Failed to load game assets ' + e.meesage);
  }
});
