// 임시

import { moveStageHandler } from './stage.handler.js';
import { gameEnd, gameStart } from './gameHandler.js';
import { broadcastNewHighScore } from './broadcast.handler.js';

const handlerMappings = {
  2: gameStart,
  3: gameEnd,
  4: broadcastNewHighScore,
  5: handleKillMob, // << 필요한건지?
  11: moveWaveHandler,
  21: handleBuyTower,
  22: handleRefundTower,
  23: handleUpgradeTower,
};

export default handlerMappings;
