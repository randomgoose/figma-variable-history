import * as jsondiffpatch from 'jsondiffpatch';
import type { Delta } from 'jsondiffpatch';

type JSON = Record<string, any>;

const jsondiffpatchInstance = jsondiffpatch.create({
  objectHash: (obj: JSON) => obj.id,
});

export function jsonDiff(left: JSON, right: JSON) {
  return jsondiffpatchInstance.diff(left, right);
}

export function jsonPatch(json: JSON, delta: Delta | Delta[]) {
  delta = Array.isArray(delta) ? delta : [delta];
  let result = JSON.parse(JSON.stringify(json));
  for (const currentDelta of delta) {
    result = jsondiffpatchInstance.patch(result, currentDelta as Delta);
  }
  return result;
}

export function jsonUnpatch(json: JSON, delta: Delta | Delta[]) {
  delta = Array.isArray(delta) ? delta : [delta];
  let result = JSON.parse(JSON.stringify(json));
  for (let i = delta.length - 1; i >= 0; i--) {
    result = jsondiffpatchInstance.unpatch(result, delta[i] as Delta);
  }
  return result;
}
