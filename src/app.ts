import express, { Response } from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';
import { authMiddleware } from './middleware/auth';
import { loggerMiddleware, logger } from './middleware/logger';
import { BehavioralService } from './services/behavioralService';
import { Trade } from './types';

const app = express();
const prisma = new PrismaClient();

app.use(cors());
app.use(express.json());
app.use(loggerMiddleware);

// GET / - API Welcome Page
app.get('/', (req: any, res: Response) => {
  res.json({
    message: "Welcome to the NevUp Behavioral Intelligence API",
    version: "1.0.0",
    endpoints: {
      health: "/health",
      metrics: "/users/:userId/metrics"
    },
    documentation: "Refer to README.md for usage instructions."
  });
});

// GET /health - Service health
app.get('/health', async (req: any, res: Response) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({
      status: 'healthy',
      database: 'connected',
      queueLag: '0ms',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(503).json({
      status: 'unhealthy',
      database: 'disconnected',
      error: error.message
    });
  }
});

// GET /users/:userId/metrics - Retrieves behavioral metrics
app.get('/users/:userId/metrics', authMiddleware, async (req: any, res: Response) => {
  const { userId } = req.params;
  const { from, to } = req.query;

  try {
    const where: any = { userId };
    
    if (from || to) {
      where.entryAt = {};
      if (from) where.entryAt.gte = new Date(from as string);
      if (to) where.entryAt.lte = new Date(to as string);
    }

    const trades = await prisma.trade.findMany({
      where,
      orderBy: { entryAt: 'asc' }
    });

    const metrics = BehavioralService.calculateMetrics(trades as unknown as Trade[]);

    res.json({
      userId,
      period: {
        from: from || 'all-time',
        to: to || 'present'
      },
      metrics,
      traceId: req.traceId
    });
  } catch (error) {
    logger.error('Error fetching metrics', { traceId: req.traceId, error: error.message });
    res.status(500).json({ error: 'INTERNAL_SERVER_ERROR', message: error.message });
  }
});

export default app;
