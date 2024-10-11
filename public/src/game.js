import { Base } from './base.js';
import { Monster } from './monster.js';
import { Tower } from './tower.js';
import { CLIENT_VERSION } from './constant.js';

/* 
  어딘가에 엑세스 토큰이 저장이 안되어 있다면 로그인을 유도하는 코드를 여기에 추가해주세요!
*/
let userId = null;
let assets = {};

const authObj = JSON.parse(sessionStorage.getItem('authorization'));

let serverSocket; // 서버 웹소켓 객체
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const NUM_OF_MONSTERS = 5; // 몬스터 개수

// 클래스로 만들고싶다.....
let userGold = 10000; // 유저 골드
let base; // 기지 객체
let baseHp = 100; // 기지 체력

let towerCost = 1000; // 타워 구입 비용
let towerUpgradeCost = 1000
let numOfInitialTowers = 1; // 초기 타워 개수
let towerId = 0;
let isrefund = false;
let isupgrade = false;

let monsterLevel = 1; // 몬스터 레벨
let monsterSpawnInterval = 1000; // 몬스터 생성 주기
const monsters = [];
const towers = [];

let score = 0; // 게임 점수
let highScore = 0; // 기존 최고 점수
let isInitGame = false;
let stopGameLoop = false;

let monstersSpawned = 0; // 현재 스테이지에서 스폰된 몬스터 수
let totalSpawnCount = 0; // 현재 스테이지에서 스폰해야 할 총 몬스터 수
let monsterSpawnTimer = 1000; // 몬스터 스폰을 위한 타이머

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

function placeInitialTowers() {
  for (let i = 0; i < numOfInitialTowers; i++) {
    const { x, y } = getRandomPositionNearPath(200);
    const tower = new Tower(x, y, 1);
    towers.push(tower);
    tower.draw(ctx, towerImage);
    towerId++; // 타워 건설 후, 타워 Id를 더한다.
    console.log(towerId);
  }
}

function placeNewTower() {
  if (towers.length >= 10) {
    alert('타워는 10개까지만 건설할 수 있습니다.');
  } else if (userGold < towerCost) {
    alert('잔액이 부족합니다.');
  } else if (userGold >= towerCost) {
    const { x, y } = getRandomPositionNearPath(200);
    const tower = new Tower(x, y, 1);
    towers.push(tower);
    tower.draw(ctx, towerImage);
    towerId++; // 타워 건설 후, 타워 Id를 더한다.
    console.log(towerId);
    userGold -= towerCost;
  }
}

function refundTower() {
  if (isrefund) {
    isrefund = false;
  } else {
    isrefund = true;
    isupgrade = false;
  }
}

function upgradeTower() {
const towerIndex = Math.floor(Math.random() * towers.length)
const tower = towers[towerIndex]
if (tower.level === 3){
  alert('[강화 실패] 이미 최대 레벨에 도달한 타워입니다.');
} else if (userGold < towerUpgradeCost) {
  alert('잔액이 부족합니다.');
} else if(userGold >= towerUpgradeCost){
  tower.upgrade()
  userGold -= towerUpgradeCost
}
}

function placeBase() {
  const lastPoint = monsterPath[monsterPath.length - 1];
  base = new Base(lastPoint.x, lastPoint.y, baseHp);
  base.draw(ctx, baseImage);
}

function spawnMonster() {
  if (monstersSpawned < totalSpawnCount) {
    const newMonster = new Monster(
      monsterPath,
      monsterImages,
      monsterLevel,
      assets.monster_unlock,
      assets.monster,
    );
    monsters.push(newMonster);
    console.log(newMonster);
    monstersSpawned++;
  } else {
    clearInterval(monsterSpawnTimer); // 모든 몬스터를 스폰하면 타이머 정지
  }
}

function gameLoop() {
  // 렌더링 시에는 항상 배경 이미지부터 그려야 합니다! 그래야 다른 이미지들이 배경 이미지 위에 그려져요!
  ctx.drawImage(backgroundImage, 0, 0, canvas.width, canvas.height); // 배경 이미지 다시 그리기
  drawPath(monsterPath); // 경로 다시 그리기

  ctx.font = '25px Times New Roman';
  ctx.fillStyle = 'skyblue';
  ctx.fillText(`최고 기록: ${highScore}`, 100, 50); // 최고 기록 표시
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
        alert('게임 오버. 스파르타 본부를 지키지 못했다...ㅠㅠ');
        stopGameLoop = true;
      }
      monster.draw(ctx);
    } else {
      /* 몬스터가 죽었을 때 */
      score += monster.score;
      // 여기에 몬스터 킬 핸들러 호출 코드 작성

      sendEvent(5, {
        monsterId: monster.monsterNumber,
      });

      console.log(monster);

      // 기존 코드
      // 잡거나 몬스터가 베이스를 공격하면 소멸시킨다
      monsters.splice(i, 1); //

      // 몬스터를 다 잡거나 하여 필드에 몬스터가 더 없을 때
      if (monsters.length === 0) {
        const clientTime = Date.now();
        const targetLevel = monsterLevel + 1;
        sendEvent(11, {
          currentStage: monsterLevel,
          targetStage: targetLevel,
          clientTimestamp: clientTime,
        });
      }
    }
  }

  if (!stopGameLoop) {
    requestAnimationFrame(gameLoop); // 지속적으로 다음 프레임에 gameLoop 함수 호출할 수 있도록 함
  }
}

function initGame() {
  if (isInitGame) {
    return;
  }

  monsterPath = generateRandomMonsterPath(); // 몬스터 경로 생성
  initMap(); // 맵 초기화 (배경, 몬스터 경로 그리기)
  placeInitialTowers(); // 설정된 초기 타워 개수만큼 사전에 타워 배치
  placeBase(); // 기지 배치

  // 현재 스테이지의 total_spawn_count 설정
  const { wave } = assets;
  console.log(wave.data)
  totalSpawnCount = wave.data[monsterLevel - 1].total_spawn_count;
  monstersSpawned = 0;

  // 몬스터를 주기적으로 스폰
  monsterSpawnTimer = setInterval(spawnMonster, monsterSpawnInterval);
  gameLoop(); // 게임 루프 최초 실행
  isInitGame = true;
}

function startStage() {
  // 스테이지 이동 시 필요한 초기화
  // monsterPath = generateRandomMonsterPath();
  // initMap();

  const { wave } = assets;
  totalSpawnCount = wave.data[monsterLevel - 1].total_spawn_count;
  monstersSpawned = 0;

  monsterSpawnTimer = setInterval(spawnMonster, monsterSpawnInterval);

  if (!isInitGame) {
    gameLoop();
    isInitGame = true;
  }
}

function initGameState(initGameStateInfo) {
  // 골드나 HP 등의 상태들 초기화 (서버 데이터에 의존)
  userGold = initGameStateInfo.userGold;
  baseHp = initGameStateInfo.baseHp;
  numOfInitialTowers = initGameStateInfo.numOfInitialTowers;
  monsterLevel = initGameStateInfo.monsterLevel;
  monsterSpawnInterval = initGameStateInfo.monsterSpawnInterval;
  score = initGameStateInfo.score;
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
  serverSocket.on('response', async (data) => {});

  serverSocket.on('connection', async (data) => {
    highScore = data.highScore;
    userId = data.userId;
    // 초기화 핸들러
    sendEvent(2, { payload: data.userId });
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
    console.log(data.message);
    if (data.status === 'fail') {
      alert(data.message);
      window.location.href = '/';
    } else {
      // [수빈] 추후 초기화 작업도 서버에서 data로 보내줄 예정. 초기화 데이터는 서버 인메모리 형식
      // [수빈] initGame() 이든 initGameState() 이든 둘 중 하나만 초기화로 써야 할거같음.
      if (!isInitGame) {
        console.log(data.initGameStateInfo);
        initGameState(data.initGameStateInfo);
        initGame();
      }
    }
  });

  serverSocket.on('gameEnd', (data) => {
    console.log(data.message);
    if (data.status === 'fail') {
      alert(data.message);
      window.location.href = '/';
    }
  });

  serverSocket.on('newHighScore', (data) => {
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
});

// 타워 클릭하여 환불하기
canvas.addEventListener('click', (event) => {
  const rect = canvas.getBoundingClientRect();
  const clickX = event.clientX - rect.left;
  const clickY = event.clientY - rect.top;
  const towerRangeX = 50;
  const towerRangeY = 50;

  for (let i = 0; i < towers.length; i++) {
    const tower = towers[i];

    const towerCenterX = tower.x + tower.width / 2;
    const towerCenterY = tower.y + tower.height / 2;

    const deltaX = Math.abs(towerCenterX - clickX);
    const deltaY = Math.abs(towerCenterY - clickY);

    if (deltaX <= towerRangeX && deltaY <= towerRangeY && isrefund) {
      // sendEvent(22, {
      //   towerId: tower.id,
      //   towerpos: { x: tower.x, y: tower.y },
      //   userGold,
      // });
      towers.splice(i, 1);
      userGold += towerCost * 0.5
    }
  }
});

// 타워 구입 버튼
const buyTowerButton = document.createElement('button');
buyTowerButton.textContent = '타워 구입';
buyTowerButton.style.position = 'absolute';
buyTowerButton.style.top = '10px';
buyTowerButton.style.right = '10px';
buyTowerButton.style.padding = '10px 20px';
buyTowerButton.style.fontSize = '16px';
buyTowerButton.style.cursor = 'pointer';

buyTowerButton.addEventListener('click', placeNewTower);

document.body.appendChild(buyTowerButton);

// 타워 환불 버튼
const refundTowerButton = document.createElement('button');
refundTowerButton.textContent = '타워 환불';
refundTowerButton.style.position = 'absolute';
refundTowerButton.style.top = '10px';
refundTowerButton.style.right = '150px';
refundTowerButton.style.padding = '10px 20px';
refundTowerButton.style.fontSize = '16px';
refundTowerButton.style.cursor = 'pointer';

refundTowerButton.addEventListener('click', refundTower);

document.body.appendChild(refundTowerButton);

// 타워 업그레이드 버튼
const upgradeTowerButton = document.createElement('button');
upgradeTowerButton.textContent = '타워 강화';
upgradeTowerButton.style.position = 'absolute';
upgradeTowerButton.style.top = '10px';
upgradeTowerButton.style.right = '290px';
upgradeTowerButton.style.padding = '10px 20px';
upgradeTowerButton.style.fontSize = '16px';
upgradeTowerButton.style.cursor = 'pointer';

upgradeTowerButton.addEventListener('click', upgradeTower);

document.body.appendChild(upgradeTowerButton);

const sendEvent = (handlerId, payload, timestamp) => {
  serverSocket.emit('event', {
    userId,
    clientVersion: CLIENT_VERSION,
    handlerId,
    timestamp,
    payload,
  });
};

const updateGameState = (serverState) => {};

const updateTowerState = (serverState) => {};

export { sendEvent };
