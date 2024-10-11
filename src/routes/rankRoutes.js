// server/routes/auth.js
import express from 'express';
import { ranks } from '../handlers/rankHandler.js';

const router = express.Router();

router.get('/', ranks);

export default router;
