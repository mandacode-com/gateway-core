import cookie from 'cookie';
import signature from 'cookie-signature';
import { NextFunction, Request, Response } from 'express';
import config from '../config';
import { redis } from '../config/redis';

export async function authenticate(req: Request, res: Response, next: NextFunction) {
  const cookies = cookie.parse(req.headers.cookie || '', {
    decode: (value) => signature.unsign(value, config.session.secret) || value,
  });
  const sid = cookies[config.session.name];

  if (!sid) {
    return res.status(401).send('Unauthorized');
  }
  const uuid = await redis.get(sid);
  if (!uuid) {
    return res.status(401).send('Unauthorized');
  }
  req.headers['x-uuid'] = uuid;
  req.headers['x-gateway-secret'] = config.gateway.secret;
  next();
}
