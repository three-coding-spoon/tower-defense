import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

//** 회원가입 */
export const postSignup = async (req, res, next) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({
      error: 'username , password를 입력하세요.',
    });
  }

  const usernameRegex = /^[a-z0-9]+$/;
  if (!usernameRegex.test(username)) {
    return res.status(400).json({
      error: 'username 을 소문자와 숫자를 혼합하여 사용하세요.',
    });
  }

  if (password.length < 6)
    return res.status(400).send({ message: '비밀번호를 다시 작성해주세요.' });

  // 해당 유저가 존재하는지 확인하는 쿼리 작성
  if (ExistUsername) {
    return res.status(400).json({ message: '이미 존재하는 username 입니다.' });
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  // 여기에 DB에 유저 정보 넣는 쿼리 작성

  return res.status(201).json({ id: user.id, username: user.username, message: '회원가입 성공.' });
};

//** 로그인 */
export const postLogin = async (req, res, next) => {
  const { username, password } = req.body;
  const { JWT_SECRET } = process.env;
  // 해당 유저가 존재하는지 확인하는 쿼리 작성

  if (!user) return res.status(401).json({ message: '존재하지 않는 아이디입니다.' });
  else if (!(await bcrypt.compare(password, user.password)))
    return res.status(401).json({ message: '비밀번호가 일치하지 않습니다.' });

  // 임시 유효기간 1Day (1d)
  const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '1d' });
  res.header('authorization', `Bearer ${token}`);
  return res.status(200).json({ message: '로그인 되었습니다.' });
};
