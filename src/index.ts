import express from 'express';
import logger from './config/logger';
import { reqLogger } from './middlewares/logging';
import { createProxyMiddleware } from 'http-proxy-middleware';
import 'dotenv/config';
import config from './config';
import { redis } from './config/redis';
import { authenticate } from './middlewares/auth';
import loadProxies from './config/proxies';
import cors from 'cors';
import helmet from 'helmet';

async function bootstrap() {
  const app = express();

  // Helmet
  app.use(helmet());

  // Cors middleware
  app.use(
    cors({
      origin: config.cors.origin,
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE'],
      exposedHeaders: ['x-uuid', 'x-gateway-secret'],
    })
  );

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
  loadProxies().forEach((proxy) => {
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
    logger.info(`Server started on port ${config.port}`)
  });
}

bootstrap();
