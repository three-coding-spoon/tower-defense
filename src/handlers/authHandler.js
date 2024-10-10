import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { addUser, getUserByName } from '../models/userModel.js';

//** 회원가입 */
export const register = async (req, res, next) => {
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

  const ExistUsername = await getUserByName(username);

  // 해당 유저가 존재하는지 확인하는 쿼리 작성
  if (ExistUsername) {
    return res.status(400).json({ message: '이미 존재하는 username 입니다.' });
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  await addUser(username, hashedPassword);

  const user = getUserByName(username);

  return res.status(201).json({ username: user.username, message: '회원가입 성공.' });
};

//** 로그인 */
export const login = async (req, res, next) => {
  const { username, password } = req.body;

  // 해당 유저가 존재하는지 확인하는 쿼리 작성
  const user = await getUserByName(username);

  if (!user)
    return res.status(401).json({ message: '존재하지 않는 아이디입니다.', isLogin: 'false' });
  else if (!(await bcrypt.compare(password, user.password)))
    return res.status(401).json({ message: '비밀번호가 일치하지 않습니다.', isLogin: 'false' });

  // 임시 유효기간 1Day (1d)
  const token = jwt.sign({ userId: user.id }, process.env.MY_SECRET_ACCESSKEY, { expiresIn: '1d' });
  res.header('authorization', `Bearer ${token}`);
  return res.status(200).json({ message: '로그인 되었습니다.', isLogin: 'true' });
};
