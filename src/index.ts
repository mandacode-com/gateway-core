import express from 'express';
import logger from './config/logger';
import { reqLogger } from './middlewares/logging';
import { createProxyMiddleware } from 'http-proxy-middleware';
import 'dotenv/config';
import config from './config';
import { redis } from './config/redis';
import { authenticate } from './middlewares/auth';
import proxies from './config/proxies';

async function bootstrap() {
  const app = express();

  redis
    .on('connect', () => {
      logger.info('Connected to Redis');
    })
    .connect();

  app.all('*', (_, res) => {
    res.status(404).send('Not Found');
  });

  // Authentication middleware
  app.use(authenticate);
  // Request logger middleware
  app.use(reqLogger);
  // Proxy middleware
  proxies.forEach((proxy) => {
    app.use(
      proxy.path,
      createProxyMiddleware({
        target: proxy.target,
        changeOrigin: true,
        logger: logger,
      })
    );
  });

  app.listen(config.port, () => {
    logger.info(`Server started at http://localhost:${config.port}`);
  });
}

bootstrap();
