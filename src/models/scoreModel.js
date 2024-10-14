// src/models/scoreModel.js

import pool from '../utils/db.js';

// 하이스코어 조회
export const getTopHighScore = async () => {
  const query = `SELECT MAX(high_score) as highScore FROM users`;
  const [rows] = await pool.execute(query);
  return rows[0].highScore;
};

// 하이스코어 업데이트
export const updateHighScore = async (userId, score) => {
  const query = `UPDATE users SET high_score = ? WHERE id = ?`;
  await pool.execute(query, [score, userId]);
};

// 랭크 리스트 불러오기
export const getRankList = async () => {
  const query = `SELECT username, high_score as highScore FROM users`;
  const [rows] = await pool.execute(query);
  return rows;
};

// 내 하이스코어 불러오기
export const getMyHighScore = async (userId) => {
  const query = `SELECT * FROM users WHERE id = ?`;
  const [rows] = await pool.execute(query, [userId]);
  return rows[0].high_score;
};
