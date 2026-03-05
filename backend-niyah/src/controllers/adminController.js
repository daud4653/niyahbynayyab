import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { AdminConfig } from '../models/AdminConfig.js';
import { hashPassword, verifyPassword } from '../utils/auth.js';

export async function loginAdmin(req, res) {
  const { username, password } = req.body || {};

  if (!username || !password) {
    return res.status(400).json({ message: 'Username and password are required' });
  }

  const adminConfig = await AdminConfig.findOne({ username });
  if (!adminConfig) {
    return res.status(401).json({ message: 'Incorrect username or password' });
  }

  const isValid = await verifyPassword(password, adminConfig.passwordHash);
  if (!isValid) {
    return res.status(401).json({ message: 'Incorrect username or password' });
  }

  const token = jwt.sign({ username }, env.jwtSecret, { expiresIn: '12h' });
  return res.json({ token, mustChangePassword: adminConfig.mustChangePassword === true });
}

export async function changePassword(req, res) {
  const { currentPassword, newPassword } = req.body || {};
  const { username } = req.admin;

  if (!currentPassword || !newPassword) {
    return res.status(400).json({ message: 'Current and new password are required' });
  }

  if (newPassword.length < 8) {
    return res.status(400).json({ message: 'New password must be at least 8 characters' });
  }

  const adminConfig = await AdminConfig.findOne({ username });
  if (!adminConfig) {
    return res.status(404).json({ message: 'Admin not found' });
  }

  const isValid = await verifyPassword(currentPassword, adminConfig.passwordHash);
  if (!isValid) {
    return res.status(401).json({ message: 'Current password is incorrect' });
  }

  adminConfig.passwordHash = await hashPassword(newPassword);
  adminConfig.mustChangePassword = false;
  await adminConfig.save();

  return res.json({ message: 'Password changed successfully' });
}
