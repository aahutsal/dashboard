export default function (callback: Function, delay: number, thisArg?: any) {
  let timeout: number;
  return (...args: any) => {
    const effect = () => callback.apply(thisArg || this, args);
    clearTimeout(timeout);
    timeout = setTimeout(effect, delay);
  };
}
