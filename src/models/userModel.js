// src/models/userModel.js

import pool from '../utils/db.js';
import bcrypt from 'bcrypt';

// 사용자 추가
export const addUser = async (username, password) => {
  const hashedPassword = await bcrypt.hash(password, 10);
  const query = `INSERT INTO users (username, password) VALUES (?, ?)`;
  await pool.execute(query, [username, hashedPassword]);
};

// 사용자 제거
export const removeUser = async (userId) => {
  const query = `DELETE FROM users WHERE id = ?`;
  await pool.execute(query, [userId]);
};

// 이름 기반 사용자 조회
export const getUserByName = async (username) => {
  const query = `SELECT * FROM users WHERE username = ?`;
  const [rows] = await pool.execute(query, [username]);
  return rows[0];
};

// ID 기반 사용자 조회
export const getUserById = async (userId) => {
  const query = `SELECT * FROM users WHERE id = ?`;
  const [rows] = await pool.execute(query, [userId]);
  return rows[0];
};
