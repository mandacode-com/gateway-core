import express from 'express';
import logger from './config/logger';
import { reqLogger } from './middlewares/logging';
import { createProxyMiddleware } from 'http-proxy-middleware';
import 'dotenv/config';
import config from './config';
import { redis } from './config/redis';
import { authenticate } from './middlewares/auth';
import proxies from './config/proxies';
import fs from 'fs';

async function bootstrap() {
  const app = express();

  // Create proxy.json file if it doesn't exist
  const proxyFile = './proxy.json';
  if (!fs.existsSync(proxyFile)) {
    fs.writeFileSync(proxyFile, '[]');
  }

  // Connect to Redis
  redis
    .on('connect', () => {
      logger.info('Connected to Redis');
    })
    .connect()
    .catch((err) => {
      logger.error('Failed to connect to Redis', err);
    });

  // Authentication middleware
  app.use(authenticate);
  // Request logger middleware
  app.use((req, res, next) => {
    reqLogger(req, res)('Request received');
    next();
  });
  // Proxy middleware
  proxies.forEach((proxy) => {
    app.use(
      proxy.path,
      createProxyMiddleware({
        target: proxy.target,
        changeOrigin: true,
        pathRewrite: {
          [`^${proxy.path}`]: '',
        },
      })
    );
  });

  app.listen(config.port, () => {
    logger.info(`Server started at http://localhost:${config.port}`);
  });
}

bootstrap();
