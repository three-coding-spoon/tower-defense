// 유저가 몹을 얼마나 잡았는지 기록

const waves = {};

export const initWaves = (userId) => {
  waves[userId] = new Map();
};

export const addTakenMonsterToWave = (userId, monsterId) => {
  const waveInfo = waves[userId];
  if (waveInfo.get(monsterId)) {
    waves[userId].set(monsterId, waveInfo.get(monsterId) + 1);
  } else {
    waves[userId].set(monsterId, 1);
  }
};

export const getWave = (userId) => {
  return waves[userId] || [];
};

/*
{
    1: 몇마리,
    2: 몇마리,
    // ...
}
*/

// 디노 아이템 모델
/*
    const userItems = {};

    // 게임 시작 시 아이템 기록 초기화
    export const initializeItems = (userId) => {
        userItems[userId] = [];
    };

    // 아이템 획득 기록
    export const addItem = (userId, item) => {
        if (!userItems[userId]) {
            userItems[userId] = [];
        }
        userItems[userId].push(item);
    };

    // 유저의 아이템 획득 기록 조회
    export const getUserItems = (userId) => {
        return userItems[userId] || [];
    };
*/
