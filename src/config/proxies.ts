import { Static, Type } from '@sinclair/typebox';
import { Value } from '@sinclair/typebox/value';
import fs from 'fs';

const T = Type.Object({
  path: Type.String(),
  target: Type.String(),
});

type T = Static<typeof T>;

function validate(list: T[]) {
  list.forEach((config, i) => {
    const result = [...Value.Errors(T, config)];
    if (result.length > 0) {
      throw new Error(
        `Invalid config: ${result
          .map((e) => `${e.path} ${e.message}`)
          .join(', ')} at index ${i}`
      );
    }
  });

  return list;
}

const proxies = JSON.parse(fs.readFileSync('proxy.json', 'utf-8')) as T[];

export default validate(proxies);