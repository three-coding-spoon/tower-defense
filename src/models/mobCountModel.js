// 유저가 몹을 얼마나 잡았는지 기록

const mobCount = {};

export const initmobCounts = (userId) => {
  mobCount[userId] = new Map();
};

export const addTakenMonsterTomobCount = (userId, monsterId) => {
  const mobCountInfo = mobCount[userId];
  if (mobCountInfo.get(monsterId)) {
    mobCount[userId].set(monsterId, mobCountInfo.get(monsterId) + 1);
  } else {
    mobCount[userId].set(monsterId, 1);
  }
};

export const getmobCount = (userId) => {
  return mobCount[userId] || [];
};

/**
 *
 */

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
