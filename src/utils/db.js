// server/db.js

import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
dotenv.config();

// DB 연결도 Pool로 관리
// 필요할 때 마다 DB 연결을 설정하는 게 아니라 미리 연결을 만들어 놓고 재활용
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'our-dino-db.cham02mqcx7d.us-east-1.rds.amazonaws.com',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'aaaa4321',
  database: process.env.DB_NAME || 'tower-db',
  port: process.env.DB_PORT || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

export default pool;
