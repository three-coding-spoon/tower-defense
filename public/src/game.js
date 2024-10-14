import { Base } from './base.js';
import { Monster } from './monster.js';
import { Tower } from './tower.js';
import { CLIENT_VERSION } from './constant.js';
import { GameStateMessage, GameEndMessage } from './message.js';
import { Button } from './button.js';

let userId = null;
let assets = {};
let gameOver = false;

const authObj = JSON.parse(sessionStorage.getItem('authorization'));

let serverSocket; // 서버 웹소켓 객체
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const gameStateMessage = new GameStateMessage();
const gameEndMessage = new GameEndMessage();

const NUM_OF_MONSTERS = 6; // 몬스터 개수

// 초기화할 게임 세팅 파트
let initGameData = null; // 초기화 데이터 묶음. 게임 시작 핸들러 이벤트로 데이터 받아올 예정
let isInitGame = false;

let userGold = 0; // 유저 골드
let base; // 기지 객체
let baseHp = 1000; // 기지 체력
let numOfInitialTowers = 3; // 초기 타워 개수
let towerId = 0;

// 몬스터 초기 세팅
const monsters = [];
let monsterLevel = 0; // 몬스터 레벨
let monsterSpawnInterval = 1000; // 몬스터 생성 주기
let monstersSpawned = 0; // 현재 스테이지에서 스폰된 몬스터 수
let totalSpawnCount = 0; // 현재 스테이지에서 스폰해야 할 총 몬스터 수
let monsterSpawnTimer = null; // 몬스터 스폰을 위한 타이머
let isBonusSpawned = false;

// 애니메이션 세팅
let animationId = null; // 애니메이션 아이디

// 타워 세팅
const towers = [];
let selectedTowerIndex = null; // 선택된 타워 인덱스

// 점수 세팅
let score = 0; // 게임 점수
let highScore = 0; // 기존 최고 랭킹 점수

// 버튼 생성 파트
const retryButton = new Button('재도전', `${ctx.canvas.height / 2 + 110}px`, null, retryGame); // 재도전 버튼
const exitButton = new Button('게임 종료', `${ctx.canvas.height / 2 + 160}px`, null, exitGame); // 게임 종료 버튼
const buyTowerButton = new Button('타워 구입', '10px', '10px', clickBuyTower);
const refundTowerButton = new Button('타워 판매', '10px', '150px', clickRefundTower);
const upgradeTowerButton = new Button('타워 강화', '10px', '290px', clickupgradeTower);

// 이미지 로딩 파트
const backgroundImage = new Image();
backgroundImage.src = 'images/bg.webp';

const towerImage = new Image();
towerImage.src = 'images/tower.png';

const baseImage = new Image();
baseImage.src = 'images/base.png';

const pathImage = new Image();
pathImage.src = 'images/path.png';

const monsterImages = [];
for (let i = 1; i <= NUM_OF_MONSTERS; i++) {
  const img = new Image();
  img.src = `images/monster${i}.png`;
  monsterImages.push(img);
}

let monsterPath;

// 선택된 타워 정보 표시 요소 생성
const selectedTowerInfo = document.createElement('div');
selectedTowerInfo.style.position = 'absolute';
selectedTowerInfo.style.bottom = '10px';
selectedTowerInfo.style.left = '10px';
selectedTowerInfo.style.padding = '10px';
selectedTowerInfo.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
selectedTowerInfo.style.color = 'white';
selectedTowerInfo.style.fontSize = '16px';
selectedTowerInfo.style.borderRadius = '5px';
selectedTowerInfo.innerHTML = '선택된 타워: 없음';
document.body.appendChild(selectedTowerInfo);

function generateRandomMonsterPath() {
  const path = [];
  let currentX = 0;
  let currentY = Math.floor(Math.random() * 21) + 500; // 500 ~ 520 범위의 y 시작 (캔버스 y축 중간쯤에서 시작할 수 있도록 유도)

  path.push({ x: currentX, y: currentY });

  while (currentX < canvas.width) {
    currentX += Math.floor(Math.random() * 100) + 50; // 50 ~ 150 범위의 x 증가
    // x 좌표에 대한 clamp 처리
    if (currentX > canvas.width) {
      currentX = canvas.width;
    }

    currentY += Math.floor(Math.random() * 200) - 100; // -100 ~ 100 범위의 y 변경
    // y 좌표에 대한 clamp 처리
    if (currentY < 0) {
      currentY = 0;
    }
    if (currentY > canvas.height) {
      currentY = canvas.height;
    }

    path.push({ x: currentX, y: currentY });
  }

  return path;
}

function initMap() {
  ctx.drawImage(backgroundImage, 0, 0, canvas.width, canvas.height); // 배경 이미지 그리기
  drawPath();
}

function drawPath() {
  const segmentLength = 20; // 몬스터 경로 세그먼트 길이
  const imageWidth = 60; // 몬스터 경로 이미지 너비
  const imageHeight = 60; // 몬스터 경로 이미지 높이
  const gap = 5; // 몬스터 경로 이미지 겹침 방지를 위한 간격

  for (let i = 0; i < monsterPath.length - 1; i++) {
    const startX = monsterPath[i].x;
    const startY = monsterPath[i].y;
    const endX = monsterPath[i + 1].x;
    const endY = monsterPath[i + 1].y;

    const deltaX = endX - startX;
    const deltaY = endY - startY;
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY); // 피타고라스 정리로 두 점 사이의 거리를 구함 (유클리드 거리)
    const angle = Math.atan2(deltaY, deltaX); // 두 점 사이의 각도는 tan-1(y/x)로 구해야 함 (자세한 것은 역삼각함수 참고): 삼각함수는 변의 비율! 역삼각함수는 각도를 구하는 것!

    for (let j = gap; j < distance - gap; j += segmentLength) {
      // 사실 이거는 삼각함수에 대한 기본적인 이해도가 있으면 충분히 이해하실 수 있습니다.
      // 자세한 것은 https://thirdspacelearning.com/gcse-maths/geometry-and-measure/sin-cos-tan-graphs/ 참고 부탁해요!
      const x = startX + Math.cos(angle) * j; // 다음 이미지 x좌표 계산(각도의 코사인 값은 x축 방향의 단위 벡터 * j를 곱하여 경로를 따라 이동한 x축 좌표를 구함)
      const y = startY + Math.sin(angle) * j; // 다음 이미지 y좌표 계산(각도의 사인 값은 y축 방향의 단위 벡터 * j를 곱하여 경로를 따라 이동한 y축 좌표를 구함)
      drawRotatedImage(pathImage, x, y, imageWidth, imageHeight, angle);
    }
  }
}

function drawRotatedImage(image, x, y, width, height, angle) {
  ctx.save();
  ctx.translate(x + width / 2, y + height / 2);
  ctx.rotate(angle);
  ctx.drawImage(image, -width / 2, -height / 2, width, height);
  ctx.restore();
}

function getRandomPositionNearPath(maxDistance) {
  // 타워 배치를 위한 몬스터가 지나가는 경로 상에서 maxDistance 범위 내에서 랜덤한 위치를 반환하는 함수!
  const segmentIndex = Math.floor(Math.random() * (monsterPath.length - 1));
  const startX = monsterPath[segmentIndex].x;
  const startY = monsterPath[segmentIndex].y;
  const endX = monsterPath[segmentIndex + 1].x;
  const endY = monsterPath[segmentIndex + 1].y;

  const t = Math.random();
  const posX = startX + t * (endX - startX);
  const posY = startY + t * (endY - startY);

  const offsetX = (Math.random() - 0.5) * 2 * maxDistance;
  const offsetY = (Math.random() - 0.5) * 2 * maxDistance;

  return {
    x: posX + offsetX,
    y: posY + offsetY,
  };
}

function placeInitialTowers(x, y) {
  for (let i = 0; i < numOfInitialTowers; i++) {
    const { x: newX, y: newY } = getRandomPositionNearPath(200);
    const tower = new Tower(newX, newY, 1);
    towers.push(tower);
    sendEvent(30, { towerData: tower, index: towers.length - 1 });
  }
}

function clickBuyTower() {
  sendEvent(21, { userGold: userGold });
}

function highlightSelectedTower() {
  if (selectedTowerIndex === null) return;

  const tower = towers[selectedTowerIndex];
  ctx.save();
  ctx.strokeStyle = 'red';
  ctx.lineWidth = 3;
  // 타워 주변에 사각형을 그려 하이라이트
  ctx.strokeRect(tower.x - 5, tower.y - 5, tower.width + 10, tower.height + 10);
  ctx.restore();
}

function placeNewTower() {
  gameStateMessage.showMessage(4);
  const { x, y } = getRandomPositionNearPath(200);
  const tower = new Tower(x, y, 1);
  towers.push(tower);
  sendEvent(30, { towerData: tower, index: towers.length - 1 });
  towerId++; // 타워 건설 후, 타워 Id를 더한다.
}

function clickRefundTower() {
  if (selectedTowerIndex === null) {
    gameStateMessage.showMessage(15);
    return;
  }
  const tower = towers[selectedTowerIndex];
  sendEvent(22, { tower: tower, towerIndex: selectedTowerIndex });
}

function refundTower(index, refundAmount) {
  gameStateMessage.showMessage(6);
  towers.splice(index, 1);
  userGold += refundAmount;

  // 선택된 타워가 제거되었으므로 선택 상태 초기화
  selectedTowerIndex = null;
  upgradeTowerButton.disabled = true;
}

// 타워 강화
function clickupgradeTower() {
  if (selectedTowerIndex === null) {
    gameStateMessage.showMessage(16);
    return;
  }

  const tower = towers[selectedTowerIndex];
  sendEvent(23, { userGold: userGold, tower: tower, towerIndex: selectedTowerIndex });
}

function upgradeTower(index, cost) {
  gameStateMessage.showMessage(5);
  const tower = towers[index];
  const upgradeCost = cost;

  tower.upgrade();
  userGold -= upgradeCost;
  sendEvent(30, { towerData: tower, index: index });

  // 선택된 타워가 강화되었으므로 선택 상태 초기화
  selectedTowerIndex = null;
  upgradeTowerButton.disabled = true;
}

function placeBase() {
  const lastPoint = monsterPath[monsterPath.length - 1];
  base = new Base(lastPoint.x, lastPoint.y, baseHp);
  base.draw(ctx, baseImage);
}

function spawnMonster() {
  const bonuseChance = 0.5;
  if (monstersSpawned < totalSpawnCount) {
    const isBonus = Math.random() <= bonuseChance;

    // 보너스 몬스터가 이미 스폰되었다면 마지막 파라미터를 false로 설정
    const shouldSpawnBonus = isBonus && !isBonusSpawned;

    const newMonster = new Monster(
      monsterPath,
      monsterImages,
      monsterLevel,
      assets.monster_unlock,
      assets.monster,
      shouldSpawnBonus, // 정확한 보너스 스폰 여부 설정
    );

    monsters.push(newMonster);

    // 새로운 보너스 몬스터가 스폰되었을 때 플래그 설정
    if (shouldSpawnBonus) {
      isBonusSpawned = true;
      console.log('황고 출현');
    }
    monstersSpawned++;
  } else {
    clearInterval(monsterSpawnTimer); // 모든 몬스터를 스폰하면 타이머 정지
  }
}

function gameLoop() {
  // 렌더링 시에는 항상 배경 이미지부터 그려야 합니다! 그래야 다른 이미지들이 배경 이미지 위에 그려져요!
  if (!gameOver) {
    ctx.drawImage(backgroundImage, 0, 0, canvas.width, canvas.height); // 배경 이미지 다시 그리기
    drawPath(monsterPath); // 경로 다시 그리기

    ctx.font = '25px Times New Roman';
    ctx.textAlign = 'start';
    ctx.fillStyle = 'skyblue';
    ctx.fillText(`최고 랭킹 점수: ${highScore}`, 100, 50); // 최고 기록 표시
    ctx.fillStyle = 'white';
    ctx.fillText(`점수: ${score}`, 100, 100); // 현재 스코어 표시
    ctx.fillStyle = 'yellow';
    ctx.fillText(`골드: ${userGold}`, 100, 150); // 골드 표시
    ctx.fillStyle = 'black';
    ctx.fillText(`현재 레벨: ${monsterLevel}`, 100, 200); // 최고 기록 표시

    // 타워 그리기 및 몬스터 공격 처리
    towers.forEach((tower) => {
      tower.draw(ctx, towerImage);
      tower.updateCooldown();
      monsters.forEach((monster) => {
        const distance = Math.sqrt(
          Math.pow(tower.x - monster.x, 2) + Math.pow(tower.y - monster.y, 2),
        );
        if (distance < tower.range) {
          tower.attack(monster);
        }
      });
    });

    // 선택된 타워 하이라이팅
    highlightSelectedTower();

    // 몬스터가 공격을 했을 수 있으므로 기지 다시 그리기
    base.draw(ctx, baseImage);

    for (let i = monsters.length - 1; i >= 0; i--) {
      const monster = monsters[i];
      if (monster.hp > 0) {
        const isDestroyed = monster.move(base);
        if (isDestroyed) {
          /* 게임 오버 */
          sendEvent(3, {
            clientScore: score,
          });
          // 게임 오버에 따른 메시지 박스 출력 (재도전, 게임 종료)
          gameEndMessage.show();
          gameOver = true;
        }
        monster.draw(ctx);
      } else {
        if (monster.isKilledByPlayer) {
          // 플레이어 공격에 의해 몬스터가 죽었을 때
          score += monster.score;
          userGold += monster.score;

          sendEvent(5, {
            monsterId: monster.monsterNumber,
          });
        }

        // 기존 코드
        // 잡거나 몬스터가 베이스를 공격하면 소멸시킨다
        monsters.splice(i, 1);

        const clientTime = Date.now();

        // 몬스터를 다 잡거나 하여 필드에 몬스터가 더 없을 때
        if (monsters.length === 0 && monstersSpawned === totalSpawnCount) {
          const targetLevel = monsterLevel + 1;

          if (targetLevel > assets.wave.data.length) {
            // 모든 웨이브 완료 시
            sendEvent(3, {
              clientScore: score,
            });
            // 게임 클리어에 따른 메시지 박스 출력 (재도전, 게임 종료)
            gameEndMessage.isVictory = true;
            gameEndMessage.show();
            gameOver = true;
          } else {
            sendEvent(11, {
              currentStage: monsterLevel,
              targetStage: targetLevel,
              clientTimestamp: clientTime,
            });

            gameStateMessage.showMessage(2);
          }
        }
      }
    }
  }

  // 게임 현황에 대한 메시지 표시
  gameStateMessage.draw(ctx);

  // 게임 종료 시 메뉴판 표시
  gameEndMessage.draw(ctx);

  // 게임 종료 시 게임 종료, 재도전 버튼 표시할 수 있도록 설정
  // 또한 타워 구입, 판매, 업그레이드는 가려주기로 설정
  if (gameOver) {
    retryButton.show();
    exitButton.show();
    buyTowerButton.hide();
    refundTowerButton.hide();
    upgradeTowerButton.hide();
  }

  // 선택된 타워 정보 업데이트
  if (selectedTowerIndex !== null) {
    const selectedTower = towers[selectedTowerIndex];
    selectedTowerInfo.innerHTML = `
        <strong>선택된 타워 정보</strong><br>
        레벨: ${selectedTower.level}<br>
        공격력: ${selectedTower.attackPower}<br>
        사거리: ${selectedTower.range}
      `;
  } else {
    selectedTowerInfo.innerHTML = '선택된 타워: 없음';
  }

  animationId = requestAnimationFrame(gameLoop); // 지속적으로 다음 프레임에 gameLoop 함수 호출할 수 있도록 함
}

function initGame() {
  if (isInitGame) {
    return;
  }
  buyTowerButton.show();
  refundTowerButton.show();
  upgradeTowerButton.show();
  retryButton.hide();
  exitButton.hide();
  gameEndMessage.hide();
  gameStateMessage.showMessage(1);
  monsterPath = generateRandomMonsterPath(); // 몬스터 경로 생성
  initMap(); // 맵 초기화 (배경, 몬스터 경로 그리기)
  placeBase(); // 기지 배치

  for (let i = 0; i < numOfInitialTowers; i++) {
    const { x, y } = getRandomPositionNearPath(200);
    sendEvent(20, { towerPos: { x, y }, towerId });
    towerId++;
  } // 설정된 초기 타워 개수만큼 사전에 타워 배치

  // 현재 스테이지의 total_spawn_count 설정
  const { wave } = assets;
  totalSpawnCount = wave.data[monsterLevel - 1].total_spawn_count;
  monstersSpawned = 0;

  // 몬스터를 주기적으로 스폰
  startSpawnMonster();

  gameLoop(); // 게임 루프 최초 실행
  isInitGame = true;
}

function startStage() {
  // 스테이지 이동 시 필요한 초기화
  clearInterval(monsterSpawnTimer);

  const { wave } = assets;
  totalSpawnCount = wave.data[monsterLevel - 1].total_spawn_count;
  monstersSpawned = 0;
  isBonusSpawned = false;
  startSpawnMonster();

  if (!isInitGame) {
    gameLoop();
    isInitGame = true;
  }
}

function initGameState() {
  // 골드나 HP 등의 상태들 초기화 (서버 데이터에 의존)
  userGold = initGameData.userGold;
  baseHp = initGameData.baseHp;
  numOfInitialTowers = initGameData.numOfInitialTowers;
  monsterLevel = initGameData.monsterLevel;
  monsterSpawnInterval = initGameData.monsterSpawnInterval;
  score = initGameData.score;
}

function retryGame() {
  // 게임 재시작 해주기 위한 초기화 작업
  console.log('게임 재시작 합니다.');

  // 배열안에 있는 값을 모두 삭제하는 법 => arr.length = 0
  monsters.length = 0;
  towers.length = 0;
  gameOver = false;
  isInitGame = false;
  isBonusSpawned = false;
  monstersSpawned = 0;
  totalSpawnCount = 0;
  gameEndMessage.isVictory = false;
  clearInterval(monsterSpawnTimer);

  // 현재 진행중인 애니메이션 프레임을 종료 시킴 => 안하면 게임 속도가 빨라짐 (중첩)
  cancelAnimationFrame(animationId);
  animationId = null;
  sendEvent(2);
}

function startSpawnMonster() {
  if (monsterSpawnTimer !== null) {
    clearInterval(monsterSpawnTimer);
  }
  monsterSpawnTimer = setInterval(spawnMonster, monsterSpawnInterval);
}

function exitGame() {
  // 게임을 종료하기 위한 작업
  console.log('게임을 종료합니다.');
  location.reload();
}

// 이미지 로딩 완료 후 서버와 연결하고 게임 초기화
Promise.all([
  new Promise((resolve) => (backgroundImage.onload = resolve)),
  new Promise((resolve) => (towerImage.onload = resolve)),
  new Promise((resolve) => (baseImage.onload = resolve)),
  new Promise((resolve) => (pathImage.onload = resolve)),
  ...monsterImages.map((img) => new Promise((resolve) => (img.onload = resolve))),
]).then(() => {
  if (!authObj) {
    // 여기 접속이 안되어도 게임화면이 렌더링됨. => 초기화 문제가 있는지 확인이 필요.
    alert('로그인이 필요합니다.');
    window.location.href = '/';
  } else {
    /* 서버 접속 코드 (여기도 완성해주세요!) */
    serverSocket = io('http://localhost:3000', {
      auth: {
        token: authObj.value,
        clientVersion: CLIENT_VERSION,
        username: sessionStorage.getItem('username'),
      },
    });
  }

  /* 
    서버의 이벤트들을 받는 코드들은 여기다가 쭉 작성해주시면 됩니다! 
    e.g. serverSocket.on("...", () => {...});
    이 때, 상태 동기화 이벤트의 경우에 아래의 코드를 마지막에 넣어주세요! 최초의 상태 동기화 이후에 게임을 초기화해야 하기 때문입니다! 
  */
  //serverSocket.on('response', async (data) => {});

  serverSocket.on('connection', async (data) => {
    highScore = data.highScore;
    userId = data.userId;
    // 초기화 핸들러
    sendEvent(2);
  });

  serverSocket.on('disconnect', () => {
    alert('접속이 해제되었습니다. 메인홈으로 이동합니다.');
    // 메인홈으로 이동하면 세션스토리지를 비운다. (초기화 과정 및 재로그인 필요)
    sessionStorage.clear();
    window.location.href = '/';
  });

  serverSocket.on('authorization', (data) => {
    if (data.status === 'fail') {
      alert(data.message);
      window.location.href = '/';
    }
  });

  serverSocket.on('gameAssets', (data) => {
    assets = { ...data };
  });

  serverSocket.on('gameStart', (data) => {
    if (data.status === 'fail') {
      alert(data.message);
      window.location.href = '/';
    } else {
      // [수빈] 추후 초기화 작업도 서버에서 data로 보내줄 예정. 초기화 데이터는 서버 인메모리 형식
      // [수빈] initGame() 이든 initGameState() 이든 둘 중 하나만 초기화로 써야 할거같음.
      if (!isInitGame) {
        initGameData = data.initGameStateInfo;
        console.log(initGameData);

        initGameState();
        initGame();
      }
    }
  });

  serverSocket.on('gameEnd', (data) => {
    if (data.status === 'fail') {
      alert(data.message);
      window.location.href = '/';
    }
  });

  serverSocket.on('newHighScore', (data) => {
    gameStateMessage.showMessage(7);
    console.log(data);
  });

  serverSocket.on('newMyHighScore', (data) => {
    gameStateMessage.showMessage(8);
    console.log(data);
  });

  serverSocket.on('updateGameState', (syncData) => {
    updateGameState(syncData);
  });

  serverSocket.on('updateTowerState', (syncData) => {
    updateTowerState(syncData);
  });

  serverSocket.on('moveStage', (data) => {
    console.log('Received moveStage', data);
    if (data.status === 'success') {
      userGold += data.reward;
      monsterLevel = data.targetStage;
      startStage();
    } else {
      console.error('Error occured on Wave transition!');
      alert('Error occured on Wave transition!');
    }
  });

  serverSocket.on('InitialTower', (data) => {
    if (data.status === 'success') {
      placeInitialTowers(data.towerPos.x, data.towerPos.y); // 설정된 초기 타워 개수만큼 사전에 타워 배치
    } else {
      alert('Error on InitialTower');
    }
  });

  serverSocket.on('BuyTower', (data) => {
    if (data.status === 'success') {
      placeNewTower();
      userGold -= data.cost;
    } else if (data.status === 'fail' && data.message === 'tower limit') {
      gameStateMessage.showMessage(9);
    } else if (data.status === 'fail' && data.message === 'not enough gold') {
      gameStateMessage.showMessage(10);
    } else {
      console.error('Error occurred while buy the tower!');
      alert('Error occurred while buy the tower!');
    }
  });

  serverSocket.on('RefundTower', (data) => {
    if (data.status === 'fail' && data.message === 'tower mismatch') {
      gameStateMessage.showMessage(11);
    } else if (data.status === 'fail' && data.message === 'No towers on the field') {
      gameStateMessage.showMessage(12);
    } else if (data.status === 'success') {
      refundTower(data.index, data.refundAmount);
    } else {
      console.error('Error occurred while refund the tower!');
      alert('Error occurred while refund the tower!');
    }
  });

  serverSocket.on('upgradeTower', (data) => {
    if (data.status === 'fail' && data.message === 'Tower data corrupted') {
      gameStateMessage.showMessage(13);
    } else if (data.status === 'fail' && data.message === 'max level') {
      gameStateMessage.showMessage(14);
    } else if (data.status === 'fail' && data.message === 'not enough gold') {
      gameStateMessage.showMessage(10);
    } else if (data.status === 'success') {
      upgradeTower(data.index, data.cost);
    } else {
      console.error('Error occurred while upgrade the tower!');
      alert('Error occurred while upgrade the tower!');
    }
  });
});

// 서버에 이벤트 요청
const sendEvent = (handlerId, payload, timestamp) => {
  serverSocket.emit('event', {
    userId,
    clientVersion: CLIENT_VERSION,
    handlerId,
    timestamp,
    payload,
  });
};

// 캔버스 클릭 이벤트 핸들러 추가 (타워 선택)
canvas.addEventListener('click', (event) => {
  const rect = canvas.getBoundingClientRect();
  const clickX = event.clientX - rect.left;
  const clickY = event.clientY - rect.top;

  let found = false;
  for (let i = 0; i < towers.length; i++) {
    const tower = towers[i];

    // 사각형 범위 검사
    if (
      clickX >= tower.x &&
      clickX <= tower.x + tower.width &&
      clickY >= tower.y &&
      clickY <= tower.y + tower.height
    ) {
      selectedTowerIndex = i;
      found = true;
      console.log(`타워 선택됨: 인덱스 ${i}`);
      break;
    }
  }

  if (found) {
    upgradeTowerButton.disabled = false;
    console.log('강화 버튼 활성화');
  } else {
    selectedTowerIndex = null;
    upgradeTowerButton.disabled = true;
    console.log('강화 버튼 비활성화');
  }
});

export { sendEvent };
