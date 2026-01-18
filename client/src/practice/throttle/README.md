# Кастомный throttle (с опциями leading/trailing)

## Практический смысл

> Гарантирует, что функция будет вызываться не чаще одного раза за указанный интервал времени

## Базовая реализация

```js
export const throttle = (fn, delay = 300) => {
  let inThrottle = false;
  return function (...args) {
    if (!inThrottle) {
      fn.apply(this, args);
      inThrottle = true;
      setTimeout(() => {
        inThrottle = false;
      }, delay);
    }
  };
};
```

## Усложненная с leading/trailing

```js
export const throttle = (fn, delay = 300, options = {}) => {
  const { leading = true, trailing = true } = options;
  let timeoutId = null;
  let lastArgs = null;
  let lastThis = null;
  let lastInvokeTime = 0;

  const shouldInvoke = (time) => {
    const timeSinceLast = time - lastInvokeTime;
    return lastInvokeTime === 0 || timeSinceLast >= delay;
  };

  const invokeFunc = () => {
    const args = lastArgs;
    const ctx = lastThis;
    lastArgs = null;
    lastThis = null;
    lastInvokeTime = Date.now();
    return fn.apply(ctx, args);
  };

  const startTimer = () => {
    timeoutId = setTimeout(() => {
      timeoutId = null;
      if (trailing && lastArgs !== null) {
        invokeFunc();
      }
    }, delay);
  };

  const throttled = function (...args) {
    const time = Date.now();
    lastArgs = args;
    lastThis = this;

    const readyToInvoke = shouldInvoke(time);

    if (readyToInvoke) {
      if (timeoutId) {
        clearTimeout(timeoutId);
        timeoutId = null;
      }
      if (leading) {
        invokeFunc();
      } else if (trailing) {
        // leading=false, но мы в начале интервала — запускаем trailing
        startTimer();
      }
    } else if (trailing && !timeoutId) {
      // Были вызовы внутри интервала — запомним последний для trailing
      startTimer();
    }
  };

  throttled.cancel = () => {
    if (timeoutId) {
      clearTimeout(timeoutId);
      timeoutId = null;
    }
    lastArgs = null;
    lastThis = null;
    lastInvokeTime = 0;
  };

  return throttled;
};

```
