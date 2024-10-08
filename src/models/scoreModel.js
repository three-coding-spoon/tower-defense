// 스코어 관리
import pool from '../utils/db.js';

// 하이스코어 조회
export const getHighScore = async (username, score) => {
  const query = `SELECT score FROM users ORDER BY score DESC LIMIT 1`;
  const row = await pool.execute(query);
  return row;
};

// 하이스코어 업데이트
export const updateHighScore = async (username, score) => {
  const query = `UPDATE users SET score = ?`;
  await pool.execute(query, [score]);
};
