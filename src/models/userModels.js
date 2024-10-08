// 유저 정보 관리
// 코드는 레디스지만 MySQL Raw Query로 작성 예정
import redisClient from '../init/redis.js';

const USER_HASH_KEY = 'users';

// 사용자 추가
export const addUser = async (user) => {
  await redisClient.hset(USER_HASH_KEY, user.uuid, JSON.stringify(user));
};

// 사용자 제거
export const removeUser = async (uuid) => {
  const user = await redisClient.hget(USER_HASH_KEY, uuid);
  if (user) {
    await redisClient.hdel(USER_HASH_KEY, uuid);
    return JSON.parse(user);
  }
  return null;
};

// 모든 사용자 조회
export const getUsers = async () => {
  const userEntries = await redisClient.hgetall(USER_HASH_KEY);
  return Object.values(userEntries).map((user) => JSON.parse(user));
};

// 사용자 조회
export const getUserById = async (uuid) => {
  const user = await redisClient.hget(USER_HASH_KEY, uuid);
  return user ? JSON.parse(user) : null;
};
