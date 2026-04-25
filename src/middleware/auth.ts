import { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { JWTPayload } from '../types';

const SECRET = process.env.JWT_SECRET || '97791d4db2aa5f689c3cc39356ce35762f0a73aa70923039d8ef72a2840a1b02';

export const authMiddleware = (req: any, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'UNAUTHORIZED', message: 'Missing or invalid token' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, SECRET) as JWTPayload;
    req.user = decoded;

    // Tenancy Enforcement Rule: jwt.sub must match :userId in path
    const { userId } = req.params;
    if (userId && decoded.sub !== userId) {
      return res.status(403).json({ 
        error: 'FORBIDDEN', 
        message: 'Cross-tenant access denied.' 
      });
    }

    next();
  } catch (error) {
    return res.status(401).json({ error: 'UNAUTHORIZED', message: 'Invalid or expired token' });
  }
};
