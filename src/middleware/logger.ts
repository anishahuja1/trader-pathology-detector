import { Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';
import winston from 'winston';

export const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  defaultMeta: { service: 'nevup-behavioral-service' },
  transports: [
    new winston.transports.Console()
  ],
});

export const loggerMiddleware = (req: any, res: Response, next: NextFunction) => {
  const traceId = (req.headers['x-trace-id'] as string) || uuidv4();
  req.traceId = traceId;

  const start = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - start;
    logger.info('Request processed', {
      traceId,
      method: req.method,
      url: req.originalUrl,
      status: res.statusCode,
      duration: `${duration}ms`,
      userId: req.user?.sub
    });
  });

  next();
};
