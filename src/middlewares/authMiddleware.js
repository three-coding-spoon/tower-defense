import jwt from 'jsonwebtoken';

export const authValidation = (accessToken) => {
  try {
    if (!accessToken) {
      return { isVaild: false, message: '토큰이 없습니다.' };
    }

    const parts = accessToken.split(' ');
    if (parts.length !== 2) {
      return { isVaild: false, message: '올바르지 않은 인증 헤더 형식입니다.' };
    }

    const [tokenType, token] = parts;

    if (tokenType !== 'Bearer') {
      return { isVaild: false, message: '토큰 타입이 일치하지 않습니다.' };
    }

    // 토큰 검증
    const decodedToken = jwt.verify(token, process.env.MY_SECRET_ACCESSKEY);

    // decodedToken에서 userId 추출 및 검증
    const username = decodedToken.username;
    if (!username) {
      return { isVaild: false, message: '유효하지 않은 사용자 ID입니다.' };
    }

    return { isVaild: true, username, message: '토큰 인증 완료' };
  } catch (error) {
    switch (error.name) {
      case 'TokenExpiredError':
        return { isVaild: false, message: '토큰이 만료되었습니다.' };
      case 'JsonWebTokenError':
        return { isVaild: false, message: '토큰이 조작되었습니다.' };
      default:
        return {
          isVaild: false,
          message: error.message || '비정상적인 요청입니다.',
        };
    }
  }
};
