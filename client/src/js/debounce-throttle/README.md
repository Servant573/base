# Debounce vs Throttle

## Debounce

Debounce (анти-дребезг) - откладывает выполнение функции, пока поток событий не прекратится за заданный интервал (вызывается один раз в конце).

Другими словами:

> Debounce запускает функцию только после того, как с последнего вызова прошло определенное время (таймер сбрасывается после каждого вызова)


### Когда использовать

Когда важен конечный результат, а не процесс

* Поиск с автодополнением: запрос отправляется, когда пользователь перестал печатать.
* Автосохранение: сохранение данных после паузы в наборе текста. 


### Реализация

```js
const debounce = function (fn, delay = 300) {
  let timeoutId = null;
  const debounced = function (...args) {
    const context = this;
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn.apply(context, args), delay);
  };
  debounced.cancel = () => clearTimeout(timeoutId);
  return debounced;
};
```


```js
// Пример: Вызов после 300ms бездействия
const debouncedSearch = debounce(searchFunction, 300);
inputElement.addEventListener('input', debouncedSearch);
```

### Опции leading и trailing

Расширенная функциональность

| leading | trailing | Поведение                                                                |
|---------|----------|--------------------------------------------------------------------------|
| false   | true     | Вызов в конце (стандартный debounce)                                     |
| true    | false    | Вызов сразу при первом событии, затем игнорировать до окончания задержки |
| true    | true     | Вызов сразу + ещё раз в конце, если были повторные события               |
| false   | false    | Никогда не вызывается (бессмысленно)                                     |


```js
function debounce(func, wait, options = {}) {
  let timeout = null;
  let lastArgs = null;
  let lastThis = null;
  let lastCallTime = 0;
  let result;

  const { leading = false, trailing = true } = options;

  function invokeFunc(time) {
    const args = lastArgs;
    const thisArg = lastThis;
    lastArgs = lastThis = null;
    result = func.apply(thisArg, args);
    return result;
  }

  function trailingEdge(time) {
    timeout = null;
    if (trailing && lastArgs) {
      return invokeFunc(time);
    }
  }

  function timerExpired() {
    const time = Date.now();
    if (leading && timeout === null) {
      // Для leading без предыдущего таймера
      return trailingEdge(time);
    }
    if (trailing) {
      return trailingEdge(time);
    }
    timeout = null;
  }

  function debounced(...args) {
    const time = Date.now();
    const isLeading = leading && !timeout;

    lastArgs = args;
    lastThis = this;

    if (isLeading) {
      result = invokeFunc(time);
    }

    if (timeout) clearTimeout(timeout);

    timeout = setTimeout(timerExpired, wait);

    return result;
  }

  debounced.cancel = () => {
    if (timeout) clearTimeout(timeout);
    timeout = lastArgs = lastThis = null;
  };

  return debounced;
}
```

## Throttling

> Гарантирует, что функция будет вызываться не чаще одного раза за указанный интервал времени


### Когда использовать

Когда нужно ограничить частоту выполнения, но функция должна срабатывать во время действия.

* Отслеживание движения мыши (mousemove).
* Обработчик scroll или resize (чтобы не перегружать).
* Анимация, которая должна быть плавной, но не "тормозить" приложение.


### Реализация

```js
function throttle(func, limit) {
  let inThrottle = false;
  return function(...args) {
    const context = this;
    if (!inThrottle) {
      func.apply(context, args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}
```

## Посложнее

```js
function throttle(func, wait, options = { leading: true, trailing: true }) {
  let timeout = null;
  let lastArgs = null;
  let lastThis = null;
  let lastInvokeTime = 0;
  let result;

  function invoke() {
    lastInvokeTime = Date.now();
    result = func.apply(lastThis, lastArgs);
    lastThis = null;
    lastArgs = null;
  }

  function startTimer() {
    timeout = setTimeout(() => {
      timeout = null;
      if (options.trailing && lastArgs) invoke();
    }, wait);
  }

  function throttled(...args) {
    const time = Date.now();
    lastArgs = args;
    lastThis = this;

    const timeSinceLast = time - lastInvokeTime;

    if (options.leading && timeSinceLast >= wait) {
      clearTimeout(timeout);
      timeout = null;
      invoke();
      startTimer();
    } else if (options.trailing && !timeout) {
      startTimer();
    }

    return result;
  }

  throttled.cancel = () => {
    clearTimeout(timeout);
    timeout = lastArgs = lastThis = null;
  };

  return throttled;
}
```

```js
// Пример: Вызов не чаще 100ms
const throttledScroll = throttle(handleScroll, 100);
window.addEventListener('scroll', throttledScroll);
```
