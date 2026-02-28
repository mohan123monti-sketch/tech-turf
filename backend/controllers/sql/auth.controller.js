import { body } from 'express-validator';
import { createUser, findUserByEmail, findUserById } from '../../models/sql/user.model.js';
import { hashPassword, verifyPassword } from '../../utils/password.js';
import { signToken } from '../../utils/jwt.js';

export const registerValidators = [
  body('name').isString().isLength({ min: 2, max: 100 }),
  body('email').isEmail(),
  body('password').isLength({ min: 8 })
];

export async function register(req, res) {
  const { name, email, password } = req.body;
  const existing = await findUserByEmail(email);

  if (existing) {
    return res.status(409).json({ success: false, message: 'Email already in use' });
  }

  const passwordHash = await hashPassword(password);
  const user = await createUser({ name, email, passwordHash, role: 'user' });
  const token = signToken(user);

  res.status(201).json({ success: true, token, user });
}

export const loginValidators = [
  body('email').isEmail(),
  body('password').isString().isLength({ min: 1 })
];

export async function login(req, res) {
  const { email, password } = req.body;
  const user = await findUserByEmail(email);

  if (!user) {
    return res.status(401).json({ success: false, message: 'Invalid credentials' });
  }

  const passwordOk = await verifyPassword(password, user.password_hash);
  if (!passwordOk) {
    return res.status(401).json({ success: false, message: 'Invalid credentials' });
  }

  const token = signToken(user);
  res.json({
    success: true,
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      created_at: user.created_at
    }
  });
}

export async function me(req, res) {
  const user = await findUserById(req.user.id);
  if (!user) {
    return res.status(404).json({ success: false, message: 'User not found' });
  }
  res.json({ success: true, user });
}
