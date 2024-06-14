import * as jsondiffpatch from 'jsondiffpatch';
import type { Delta } from 'jsondiffpatch';
import { VariableChangeType } from '../types';

type JSON = Record<string, any>;

const jsondiffpatchInstance = jsondiffpatch.create({
  objectHash: (obj: JSON) => obj.id,
});

export function jsonDiff(left: unknown, right: unknown) {
  return jsondiffpatchInstance.diff(left, right);
}

export function jsonPatch(json: unknown, delta: Delta | Delta[]) {
  delta = Array.isArray(delta) ? delta : [delta];
  let result = JSON.parse(JSON.stringify(json));
  for (const currentDelta of delta) {
    result = jsondiffpatchInstance.patch(result, currentDelta as Delta);
  }
  return result;
}

export function jsonUnpatch(json: unknown, delta: Delta | Delta[]) {
  delta = Array.isArray(delta) ? delta : [delta];
  let result = JSON.parse(JSON.stringify(json));
  for (let i = delta.length - 1; i >= 0; i--) {
    result = jsondiffpatchInstance.unpatch(result, delta[i] as Delta);
  }
  return result;
}

export function formatDelta(
  delta: Delta,
  cb: (info: {
    type: VariableChangeType;
    path: string;
    value?: unknown;
    oldValue?: unknown;
  }) => void,
  path = ''
) {
  if (typeof delta !== 'object') return;

  for (const key in delta) {
    if (delta.hasOwnProperty(key)) {
      // @ts-ignore
      const value = delta[key];
      const currentPath = path ? `${path}.${key}` : key;

      if (Array.isArray(value)) {
        switch (value.length) {
          case 1:
            cb({
              type: 'added',
              path: currentPath,
              value: value[0],
            });
            break;
          case 2:
            cb({
              type: 'modified',
              path: currentPath,
              value: value[1],
              oldValue: value[0],
            });
            break;
          case 3:
            if (value[1] === 0 && value[2] === 0) {
              cb({
                type: 'removed',
                path: currentPath,
                oldValue: value[0],
              });
            }
            break;
          default:
            break;
        }
      } else if (typeof value === 'object' && value !== null) {
        formatDelta(value, cb, currentPath);
      }
    }
  }
}
