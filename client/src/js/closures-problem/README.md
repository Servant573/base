# Closures и memory leaks
Как closures могут привести к memory leak в реальном приложении? Приведи пример типичной утечки в коде с добавлением/удалением event listener'ов и объясни, как её избежать.

Замыкания (Closures) в JS могут вызывать утечки памяти, когда они непреднамеренно хранят ссылки на большие объекты, не давая сборщику мусора их освободить;
избегать этого можно, ограничивая область видимости, удаляя ненужные ссылки, очищая слушатели событий и таймеры.

Классический пример утечки с event listener + closure (часто встречается в legacy-коде и SPA):

```js

function setupButton(buttonId) {
  const button = document.getElementById(buttonId);
  const largeData = new Array(10_000_000).fill('heavy data'); // ~80–100 МБ

  function handleClick() {
    console.log('Clicked!', largeData.length);
    // Используем largeData — closure удерживает его
  }

  button.addEventListener('click', handleClick);

  // Проблема: мы НИКОГДА не удаляем слушатель!
  // Если кнопка удаляется из DOM (например, при переходе на другую страницу в SPA),
  // button всё ещё удерживается в замыкании handleClick → handleClick удерживает largeData
  // → largeData не собирается GC → утечка памяти
}
```

Почему это утечка:

* Ссылка: button → event listener → handleClick → largeData
* Даже если button удалён из DOM, сборщик мусора не может удалить largeData, потому что на него есть живая ссылка через closure.
* В SPA это накапливается при каждом переходе по роутам → память растёт.

Как исправить?

```js

function setupButton(buttonId) {
  const button = document.getElementById(buttonId);
  const largeData = new Array(10_000_000).fill('heavy data');

  const handleClick = () => {
    console.log('Clicked!', largeData.length);
  };

  button.addEventListener('click', handleClick);

  // Возвращаем функцию очистки (паттерн, часто используемый в хуках/компонентах)
  return () => {
    button.removeEventListener('click', handleClick);
    // largeData теперь может быть собран, когда замыкание исчезнет
  };
}

// Использование:
const cleanup = setupButton('my-button');

// Когда кнопка/компонент больше не нужен:
cleanup(); // Обязательно вызвать!
```

В реальных фреймворках (Vue, React) это решается автоматически через cleanup в onUnmounted / useEffect return.
Другие частые источники утечек через closures:

* Неочищенные setInterval / setTimeout
* MutationObserver / ResizeObserver без observer.disconnect()
* Ссылки на удалённые DOM-узлы в кэше/массиве
* Глобальные переменные, захваченные в замыканиях
