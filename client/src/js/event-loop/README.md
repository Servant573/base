# Event Loop

* Объясни подробно, как работает Event Loop в JavaScript.
* Что такое macrotask и microtask?
* Приведи пример кода, в котором порядок выполнения будет неожиданным для junior-разработчика (с Promise, setTimeout, queueMicrotask).

Event Loop это механизм, который предоставляет среда выполнения JavaScript, для того чтобы основной поток задач не блокировался при выполнении асинхронных задач.

Есть браузерный Event Loop, есть и для nodeJS. Они схожи, однако есть и отличия.

Рассмотрим браузерный вариант.

Внутри Event Loop есть разделение на очереди:

- Макрозадачи (таймеры (setTimeout, setInterval); события пользовательского интерфейса (например, клики мыши); сетевые запросы (например, fetch или XMLHttpRequest))
- Микрозадачи. Выполняются сразу после завершения текущей синхронной задачи, но перед началом следующей макрозадачи. Примеры: Промисы (Promise.resolve(), Promise.reject()).MutationObserver.async/await)

Алгоритм такой:

1. Сначала выполняется текущий синхронный код;
2. Затем выполняются все микрозадачи в очереди Microtask queue до тех пор, пока очередь не станет пустой;
3. После этого выполняется следующая макрозадача из очереди Macrotask queue и т.д.

```js

setTimeout(() => {
  console.log('Timeout 1');
  Promise.resolve().then(() => {
    console.log('Promise in timeout');
  });
}, 0);

Promise.resolve().then(() => {
  console.log('First promise');
  Promise.resolve().then(() => {
    console.log('Second promise');
  });
});

console.log('Start');

/*
* Порядок вывода:

Start -> Синхронный код идет вперед
First promise -> выполняем первую микрозадачу
Second promise -> выполняем вторую микрозадачу
Timeout 1 -> микрозадачи кончились, значит выполняем макрозадачу, достаём одну
Promise in timeout -> внутри макрозадачи была микрозадача, выполняем её
* */

```


Ещё больше примеров:

```js

// Promise, setTimeout, queueMicrotask
console.log('1')

new Promise((resolve) => {
  console.log('2')
  resolve()
}).then(() => {
  console.log('3')
})

console.log('4')

setTimeout(() => {
  console.log('5')
}, 0)

queueMicrotask(() => {
  console.log('6')
})

console.log('7')

/*
* 1
* 2
* 4
* 7
* 3
* 6
* 5
* */
```

```js

setTimeout(() => {
  console.log('Timeout 1');
  Promise.resolve().then(() => {
    console.log('Promise in timeout');
  });
}, 0);

Promise.resolve().then(() => {
  console.log('First promise');
  Promise.resolve().then(() => {
    console.log('Second promise');
  });
});

console.log('Start');

/*
* Start
* First promise
* Second promise
* Timeout 1
* Promise in timeout
* */
```

```js

Promise.resolve().then(() => {
  console.log('First promise');
  Promise.resolve().then(() => {
    console.log('Second promise');

    setTimeout(() => {
      console.log('Timeout 1');
      Promise.resolve().then(() => {
        console.log('Promise in timeout');
      });
    }, 0);
  });

  console.log('End first promise')
});

console.log('Start');

/*
* Start
* First promise
* End first promise
* Second promise
* Timeout 1
* Promise in timeout
* */
```

```js

Promise.resolve().then(() => {
  console.log('First promise');
  Promise.resolve().then(() => {
    console.log('Second promise');

    setTimeout(() => {
      console.log('Timeout 1');
      Promise.resolve().then(() => {
        console.log('Promise in timeout');
      });
    }, 0);
  });

  console.log('End first promise')
});

console.log('Start');

/*
* Start
* First promise
* End first promise
* Second promise
* Timeout 1
* Promise in timeout
* */
```
