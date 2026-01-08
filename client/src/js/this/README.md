# this и контекст

1. Назови все возможные значения this в JavaScript (в разных ситуациях).
2. Как работает this в стрелочных функциях?
3. Почему в обработчике события внутри объекта-метода this может указывать на DOM-элемент, а не на объект?


* this - это ключевое слово. В различных ситуациях может иметь различное значение. В большинстве случаем значение this определяется тем, как была вызвана функция.

* this не может быть установлено путём присваивания во время исполнения кода.

* this может иметь разное значение при каждом вызове функции.

* Чтобы привязать к функции определённый this используй bind(), call(), apply()

* Стрелочные функции не создают собственные привязки к this. Они сохраняют значение this лексического окружения, в котором были созданы.

Примеры

```js

const test = {
  prop: 42,
  func: function () {
    return this.prop;
  },
};

console.log(test.func());
// 42

const test2 = {
  prop: 24,
  func: () => {
    return this.prop;
  },
};

console.log(test2.func());
// undefined стрелочная функция не имеет контекста объекта test2

console.log(test.func.call(test2));
// 24 явно указали this

console.log(test2.func.call(test));
// undefined стрелочной функции невозможно указать this


// Примеры работы bind, call, apply

// В качестве первого аргумента методов call или apply может быть передан объект,
// на который будет указывать this.
var obj = { a: "Custom" };

// Это свойство принадлежит глобальному объекту
var a = "Global";

function whatsThis() {
  return this.a; //значение this зависит от контекста вызова функции
}

console.log(whatsThis()) // "Global"
console.log(whatsThis.call(obj)) // "Custom"
console.log(whatsThis.apply(obj)) // "Custom"
console.log(whatsThis.bind(obj)()) // "Custom"

// Следующий пример

function add(c, d) {
  return this.a + this.b + c + d;
}

var o = { a: 1, b: 3 };


console.log(add.call(o, 3, 4)) // 11
console.log(add.apply(o, [4, 5])) // 13


// Пример работы с bind

function f() {
  return this.a;
}

const g = f.bind({ a: "qwerty" });

console.log(g()) // "qwerty"

const h = g.bind({ a: "test" })
console.log(h()) // "qwerty" bind сработает только 1 раз

const o = { a: 37, f, g, h };

console.log(o.a, o.f(), o.g(), o.h()) // 37, 37, "qwerty", "qwerty"

```

Поговорим о разных контекстах, сценариях

1. Global

В глобальном контексте выполнения (за пределами каких либо функций) this ссылается на глобальный объект вне зависимости от режима (строгий/не строгий)

```js
console.log(this === window) // true для браузера
console.log(this === global) // true для nodeJs

this.a = 37

console.log(window.a) // 37 для браузера;
console.log(a) // 37 для браузера;
```

2. Function контекст

Здесь this зависит от того каким образом была вызвана функция

В нестрогом режиме по умолчанию будет использоваться global (window)

```js

function f1() {
  return this;
}

console.log(f1() === window) // true (не строгий режим!)
```

В строгом режиме если у нас this не установлен в контексте выполнения, то он останется undefined

```js

function f2() {
  "use strict"; // см. strict mode
  return this;
}
console.log(f2() === undefined) // true
console.log(window.f2() === window) // true Но если задать контекст, то картина меняется

```


Стрелочные функции создают замыкание this из окружающего контекста выполнения.

```js

// Прикол со стрелочной функцией

const obj2 = {
  getThisGetter() {
    return () => this;
  },
};

const fn = obj2.getThisGetter(); // Здесь мы вызываем метод и замыкаем obj2 в качестве this для стрелочной функции внутри
console.log(fn() === obj2); // true При последующем вызове стрелочной функции, мы удобно получаем наш объект

// однако
const fn2 = obj2.getThisGetter; // Здесь мы не вызываем метод и присваиваем его просто переменной, соответственно наш контекст в нестрогом исполнении будет глобальным
console.log(fn2()() === globalThis); // true
```

В методах объекта this будет закреплен за объектом

```js

var o = {
  prop: 37,
  f: function () {
    return this.prop;
  },
};

console.log(o.f()); // logs 37
```

this в цепочке object's prototype:
Даже если у объекта нет своего метода с использованием this, метод прототипа отработает без проблем

```js

var o = {
  f: function () {
    return this.a + this.b;
  },
};
var p = Object.create(o);
p.a = 1;
p.b = 4;

console.log(p.f()); // 5
```

this с геттерами/сеттерами

Здесь такое же поведение, что и для работы с просто объектами. this также будет привязан к объекту

Когда функция используется как конструктор (с ключевым словом new), this связано с создаваемым новым объектом.


```js
function C() {
  this.a = 1
}

const c = new C()

console.log(c.a) // 1

function C2() {
  this.a = 2
  return { a: 3 } // Если мы возвращаем объект, то он будет привязан к this
}

const c2 = new C2()

console.log(c2.a) // 3
```

Как обработчик событий DOM:

Когда функция используется как обработчик события, то this присваивается элементу, с которого начинается это событие

```js

// Когда вызывается как обработчик, связанный элемент становится синим
function bluify(e) {
  // Всегда true
  console.log(this === e.currentTarget);
  // true, когда currentTarget и target один объект
  console.log(this === e.target);
  this.style.backgroundColor = "#A5D9F3";
}

// Получить список каждого элемента в документе
var elements = document.getElementsByTagName("*");

// Добавить bluify как обработчика кликов, чтобы при
// нажатии на элемент он становился синим
for (var i = 0; i < elements.length; i++) {
  elements[i].addEventListener("click", bluify, false);
}
```

Когда код вызван из инлайнового обработчика, this указывает на DOM-элемент, в котором расположен код события:

```js
<button onclick="alert(this.tagName.toLowerCase());">Показать this</button>
```
Код выше выведет 'button'. Следует отметить, что this будет указывать на DOM-элемент только во внешних (не вложенных) функциях:

```js

<button onclick="alert((function() {return this;} ()));">
  Показать вложенный this
</button>
```
В этом случае this вложенной функции не будет установлен, так что будет возвращён global/window объект.
