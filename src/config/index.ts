import { Static, Type } from '@sinclair/typebox';
import { Value } from '@sinclair/typebox/value';

const T = Type.Object({
  port: Type.Number(),
  gateway: Type.Object({
    secret: Type.String(),
  }),
  session: Type.Object({
    name: Type.String(),
    secret: Type.String(),
  }),
  redis: Type.Object({
    url: Type.String(),
  }),
});

type T = Static<typeof T>;

function validate(raw: Record<string, unknown>) {
  const config: T = {
    port: parseInt(raw.PORT as string),
    gateway: {
      secret: raw.GATEWAY_SECRET as string,
    },
    session: {
      name: raw.SESSION_NAME as string,
      secret: raw.COOKIE_SECRET as string,
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
