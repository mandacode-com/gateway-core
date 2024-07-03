import { NextFunction, Request, Response } from 'express';
import logger from '../config/logger';

export function reqLogger(req: Request, res: Response, next: NextFunction) {
  logger.info(
    `[${req.method}] path:${req.url} host:${req.headers.host} ip:${req.ip} user-agent:${req.headers['user-agent']}`
  );
  next();
}
