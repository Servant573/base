# Кастомный debounce (с опциями leading/trailing)

## Практический смысл

Debounce (анти-дребезг) - откладывает выполнение функции, пока поток событий не прекратится за заданный интервал (вызывается один раз в конце).

Другими словами:

> Debounce запускает функцию только после того, как с последнего вызова прошло определенное время (таймер сбрасывается после каждого вызова)

## Упрощенная реализация

```js
export const debounce = (fn, delay = 300) => {
  let timerId;
  return (...args) => {
    clearTimeout(timerId);
    timerId = setTimeout(() => fn.apply(this, args), delay);
  };
};
```

## Усложненная с leading/trailing

Расширенная функциональность

| leading | trailing | Поведение                                                                |
|---------|----------|--------------------------------------------------------------------------|
| false   | true     | Вызов в конце (стандартный debounce)                                     |
| true    | false    | Вызов сразу при первом событии, затем игнорировать до окончания задержки |
| true    | true     | Вызов сразу + ещё раз в конце, если были повторные события               |
| false   | false    | Никогда не вызывается (бессмысленно)                                     |


```js
export const debounce = (fn, delay = 300, options = {}) => {
  const { leading = false, trailing = true } = options;
  let timerId = null;
  let lastArgs = null;
  let lastThis = null;

  function callFn() {
    fn.apply(lastThis, lastArgs);
  }

  function trailingEdge() {
    if (trailing && lastArgs) {
      callFn();
    }
    timerId = null;
    lastThis = null;
    lastArgs = null;
  }

  function debounced(...args) {
    lastArgs = args;
    lastThis = this;
    const isLeading = leading && !timerId;

    if (timerId) clearTimeout(timerId);

    timerId = setTimeout(trailingEdge, delay);

    if (isLeading) {
      callFn();
      lastArgs = null;
      lastThis = null;
    }
  }

  debounced.cancel = () => {
    if (timerId) clearTimeout(timerId);
    timerId = null;
    lastArgs = null;
    lastThis = null;
  };

  return debounced;
};
```
