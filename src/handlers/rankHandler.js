import { authValidation } from '../middlewares/authMiddleware.js';
import { getRankList } from '../models/scoreModel.js';
import { getUserByName } from '../models/userModel.js';

// 랭크 리스트를 조회하는 API
export const ranks = async (req, res, next) => {
  try {
    const auth = req.header('authorization');
    console.log(auth);

    // 토큰 인증
    const authValid = authValidation(auth);
    console.log(authValid);

    if (!authValid.isVaild) {
      return res.status(401).json({ status: 'fail', message: authValid.message });
    }

    // 유저 가져오기
    // 유저 검증은 따로 하지않음. (전체 랭킹을 조회하는 것이기 때문)
    // 단, 내 랭킹 출력 부분은 rankIndex가 0 이상일 경우만 출력하도록 함.
    const user = await getUserByName(authValid.username);

    // DB 조회
    const rankList = await getRankList();

    // DB 검증
    if (!rankList) {
      return res.status(404).json({ status: 'fail', message: '랭크를 조회할 수 없습니다.' });
    }

    // 랭크리스트 정렬
    rankList.sort((a, b) => b.highScore - a.highScore);

    // 내 랭크 번호 확인
    const myRankIndex = rankList.findIndex((rank) => rank.username === user.username);

    // 결과 응답
    return res.status(200).json({
      status: 'success',
      data: { rankList, myRankIndex },
      message: '랭크 조회 성공',
    });
  } catch (err) {
    return res.status(500).json({ status: 'fail', message: '조회 중 에러 발생' });
  }
};
