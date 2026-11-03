export const throttle = <T extends (...args: any) => any>(fn: T, time: number) => {
  let lastTime = 0;
  return (...args: Parameters<T>) => {
    const currentTime = new Date().getTime();
    if ((currentTime - lastTime) > time) {
      fn(...args as any);
      lastTime = currentTime;
    };
  };
};