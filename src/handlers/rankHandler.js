import { authValidation } from '../middlewares/authMiddleware.js';
import { getMyHighScore, getTopHighScore } from '../models/scoreModel.js';

/** 랭크 리스트를 조회하는 API */
export const ranks = (req, res, next) => {
  try {
    const auth = req.header('authorization');
    console.log(auth);

    // 토큰 인증
    const authValid = authValidation(auth);

    if (!authValid.isVaild) {
      return res.status(401).json({ status: 'fail', message: authValid.message });
    }

    // DB 조회
    const rankList = getTopHighScore();
    const myScore = getMyHighScore(authValid.username);

    // DB 검증
    if (!rankList) {
      return res.status(404).json({ status: 'fail', message: '랭크를 조회할 수 없습니다.' });
    }

    // 결과 응답
    return res.status(200).json({
      status: 'success',
      data: { rankList, myScore },
      message: '랭크 조회 성공',
    });
  } catch (err) {
    return res.status(500).json({ status: 'fail', message: '조회 중 에러 발생' });
  }
};
