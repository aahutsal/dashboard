export default (obj: any) => Object.keys(obj).reduce((res: any, k) => {
  res[k] = obj[k] || undefined;
  return res;
}, {});
