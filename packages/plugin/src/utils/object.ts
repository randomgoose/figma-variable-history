export function updateObjectValues<T = Record<string, any>>(
  obj: T,
  updateFn: (value: any) => any
): T {
  if (obj === null || typeof obj !== 'object') {
    throw new Error('The first argument must be an object');
  }
  if (typeof updateFn !== 'function') {
    throw new Error('The second argument must be a function');
  }

  for (const key in obj) {
    try {
      if (obj.hasOwnProperty(key)) {
        if (obj[key] !== null && typeof obj[key] === 'object') {
          updateObjectValues(obj[key], updateFn);
        } else {
          obj[key] = updateFn(obj[key]);
        }
      }

      if (updateFn(key) && updateFn(key) !== key) {
        obj[updateFn(key)] = obj[key];
        delete obj[key];
      }
    } catch (e) {
      console.error(e);
    }
  }

  return obj;
}
