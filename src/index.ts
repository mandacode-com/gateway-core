import express from 'express';
import logger from './config/logger';
import { reqLogger } from './middlewares/logging';
import { createProxyMiddleware } from 'http-proxy-middleware';
import 'dotenv/config';
import config from './config';
import { authenticate } from './middlewares/auth';
import loadProxies from './config/proxies';
import session from 'express-session';
import cors from 'cors';
import helmet from 'helmet';
import { redis } from './config/redis';
import RedisStore from 'connect-redis';

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

  // Redis connection
  const redisClient = await redis.connect();
  const sessionStore = new RedisStore({
    client: redisClient,
  });

  // Session middleware
  app.use(
    session({
      name: config.session.name,
      secret: config.session.secret,
      resave: false,
      rolling: true,
      saveUninitialized: false,
      cookie: {
        secure: true,
        domain: config.session.domain,
        sameSite: 'lax',
        maxAge: config.session.timeout,
        priority: 'high',
      },
      store: sessionStore,
    })
  );

  // Authenticate middleware
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
    logger.info(`Server started on port ${config.port}`);
  });
}
bootstrap();
