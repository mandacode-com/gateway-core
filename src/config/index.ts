import { Static, Type } from '@sinclair/typebox';
import { Value } from '@sinclair/typebox/value';

const T = Type.Object({
  port: Type.Number(),
  cors: Type.Object({
    origin: Type.String(),
  }),
  gateway: Type.Object({
    secret: Type.String(),
  }),
  session: Type.Object({
    name: Type.String(),
    domain: Type.String(),
    secret: Type.String(),
    timeout: Type.Number(),
  }),
  redis: Type.Object({
    url: Type.String(),
  }),
});

type T = Static<typeof T>;

function validate(raw: Record<string, unknown>) {
  const config: T = {
    port: parseInt(raw.PORT as string),
    cors: {
      origin: raw.CORS_ORIGIN as string || '*',
    },
    gateway: {
      secret: raw.GATEWAY_SECRET as string,
    },
    session: {
      name: raw.SESSION_NAME as string,
      domain: raw.COOKIE_DOMAIN as string,
      secret: raw.COOKIE_SECRET as string,
      timeout: parseInt(raw.SESSION_TIMEOUT as string),
    },
    redis: {
      url: raw.REDIS_URL as string,
    },
  };
  const result = [...Value.Errors(T, config)];
  if (result.length > 0) {
    throw new Error(
      `Invalid config: ${result
        .map((e) => `${e.path} ${e.message}`)
        .join(', ')}`
    );
  }
  return config;
}

export default validate(process.env);
