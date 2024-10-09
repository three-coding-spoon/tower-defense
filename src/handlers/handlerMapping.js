// src/handlers/handlerMapping.js

import { moveStageHandler } from './stageHandler.js';
import { gameEnd, gameStart } from './gameHandler.js';
import { broadcastNewHighScore } from './broadcastHandler.js';
import { handleKillMob } from './MobHandler.js';
import { handleBuyTower, handleRefundTower, handleUpgradeTower } from './towerHandler.js';

const handlerMappings = {
  1: initGameHandler, // <<< 만들어야 함
  2: gameStart,
  3: gameEnd,
  4: broadcastNewHighScore,
  5: handleKillMob,
  11: moveStageHandler,
  21: handleBuyTower,
  22: handleRefundTower,
  23: handleUpgradeTower,
};

export default handlerMappings;
