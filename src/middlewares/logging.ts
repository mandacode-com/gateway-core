import { Request, Response } from 'express';
import logger from '../config/logger';

export const reqLogger =
  (req: Request, res: Response) => (msg: string, type?: 'info' | 'error') => {
    const errorMsg = `[${req.method}] path: ${req.url}, status: ${res.statusCode}, msg: ${msg}, host: ${req.headers.host}, x-forwarded-for: ${req.headers['x-forwarded-for']}, user-agent: ${req.headers['user-agent']}`;
    if (type === 'info') {
      logger.info(errorMsg);
      return;
    } else if (type === 'error') {
      logger.error(errorMsg);
      return;
    }
  };
