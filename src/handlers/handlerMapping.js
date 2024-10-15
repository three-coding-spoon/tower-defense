// src/handlers/handlerMapping.js

import { moveStageHandler } from './stageHandler.js';
import { gameEnd, gameStart } from './gameHandler.js';
import { broadcastNewHighScore } from './broadcastHandler.js';
import { handleKillMob } from './MobHandler.js';
import {
  initialTowerHandler,
  userTowerUpdate,
  handleBuyTower,
  handleRefundTower,
  handleUpgradeTower,
} from './towerHandler.js';

const handlerMappings = {
  2: gameStart,
  3: gameEnd,
  4: broadcastNewHighScore,
  5: handleKillMob,
  11: moveStageHandler,
  20: initialTowerHandler,
  21: handleBuyTower,
  22: handleRefundTower,
  23: handleUpgradeTower,
  30: userTowerUpdate,
};

export default handlerMappings;
