// src/models/scoreModel.js

import pool from '../utils/db.js';

// 하이스코어 조회
export const getTopHighScore = async () => {
  const query = `SELECT MAX(score) as highScore FROM users`;
  const [rows] = await pool.execute(query);
  return rows[0].highScore;
};

// 하이스코어 업데이트
export const updateHighScore = async (userId, score) => {
  const query = `UPDATE users SET score = ? WHERE id = ?`;
  await pool.execute(query, [score, userId]);
};
