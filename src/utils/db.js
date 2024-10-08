// server/db.js
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
dotenv.config();

// DB 연결도 Pool로 관리
// 필요할 때 마다 DB 연결을 설정하는 게 아니라 미리 연결을 만들어 놓고 재활용
// 일단 이렇게 두는데, 쓸지는 모르겠음
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'your_username',
  password: process.env.DB_PASSWORD || 'your_password',
  database: process.env.DB_NAME || 'tower_defense_game',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

export default pool;
