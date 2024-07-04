import { NextFunction, Request, Response } from 'express';
import config from '../config';
import { reqLogger } from './logging';

export async function authenticate(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const log = reqLogger(req, res);

  const sid = req.session.id;
  if (!sid) {
    res.status(401);
    log('sid not found', 'error');
    return res.send('Unauthorized');
  }

  const uuid = req.session.uuid;
  if (!uuid) {
    res.status(401);
    log('uuid not found', 'error');
    return res.send('Unauthorized');
  }

  log('Authenticated', 'info');

  req.headers['x-uuid'] = uuid;
  req.headers['x-gateway-secret'] = config.gateway.secret;
  next();
}
