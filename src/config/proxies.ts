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

export default function loadProxies(file: string = 'proxy.json') {
  if (!fs.existsSync(file))
    fs.writeFileSync(file, JSON.stringify([]));
  const proxies = JSON.parse(fs.readFileSync(file, 'utf-8')) as T[];
  return validate(proxies);
}