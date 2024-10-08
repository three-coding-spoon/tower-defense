// 유저 정보 관리
// 코드는 레디스지만 MySQL Raw Query로 작성 예정
import pool from '../utils/db.js';

const USER_HASH_KEY = 'users';

// 사용자 추가
export const addUser = async (username, password) => {
  const hashedPassword = await bcrypt.hash(password, 10);
  const query = `INSERT INTO users (username, password) VALUES (?,?)`;
  await pool.execute(query, [username, hashedPassword]);
};

// 사용자 제거
export const removeUser = async (username) => {
  const query = `DELETE FROM users WHERE username = ?`;
  await pool.execute(query, [username]);
};

// 모든 사용자 조회
export const getUsers = async () => {
  const query = `SELECT * FROM users`;
  const rows = await pool.execute(query);
  return rows;
};

// 이름 기반 사용자 조회
export const getUserByName = async (username) => {
  const query = `SELECT * FROM users WHERE username = ?`;
  const row = await pool.execute(query, [username]);
  return row;
};

// ID 기반 사용자 조회
export const getUserById = async (id) => {
  const query = `SELECT * FROM users WHERE id = ?`;
  const row = await pool.execute(query, [id]);
  return row;
};
