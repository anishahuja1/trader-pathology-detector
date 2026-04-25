import app from './app';
import { logger } from './middleware/logger';

const PORT = process.env.PORT || 4010;

app.listen(PORT, () => {
  logger.info(`NevUp Behavioral Service running on http://localhost:${PORT}`);
});
