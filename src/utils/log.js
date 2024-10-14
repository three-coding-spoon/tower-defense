import pool from './db.js';

// 로그 기록
export const addLog = async (userId, handlerId, message) => {
  const query = `INSERT INTO game_logs (user_id, handler_id, message) VALUES (?, ?, ?)`;
  await pool.execute(query, [userId, handlerId, message]);
};
