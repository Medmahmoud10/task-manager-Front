import authRouter from '/src/server/routes/auth';
import bodyParser from 'body-parser';
import { Router } from 'express';
import jwt from 'jsonwebtoken';
import { Request, Response } from 'express';

const router = Router();
const SECRET_KEY = process.env.JWT_SECRET || 'your-fallback-secret-key';

// Mock user database (replace with real DB in production)
const users = [
  { id: 1, username: 'admin', password: 'admin' }
];

/**
 * @route POST /api/auth/login
 * @desc Authenticate user and return JWT token
 */
router.post('/login', (req: Request, res: Response) => {
  const { username, password } = req.body;

  // Find user (in production, use database)
  const user = users.find(u => 
    u.username === username && 
    u.password === password
  );

  if (!user) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  // Create token (expires in 1 hour)
  const token = jwt.sign(
    { userId: user.id }, 
    SECRET_KEY, 
    { expiresIn: '1h' }
  );

  res.json({ token });
});

/**
 * @route POST /api/auth/validate
 * @desc Validate JWT token
 */
router.post('/validate', (req: Request, res: Response) => {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ valid: false });
  }

  try {
    jwt.verify(token, SECRET_KEY);
    res.json({ valid: true });
  } catch {
    res.status(401).json({ valid: false });
  }
});

export default router;
