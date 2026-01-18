
export const sidebarRu = {
  '/': [
    {
      link: '/js/', text: 'JavaScript', children: [
        { link: '/js/event-loop/', text: 'Event Loop' },
        { link: '/js/closures-problem/', text: 'Closures и memory leaks' },
        { link: '/js/this/', text: 'this и контекст' },
        { link: '/js/hoisting/', text: 'Hoisting' },
        { link: '/js/debounce-throttle/', text: 'Debounce vs Throttle' },
        { link: '/js/es6/', text: 'Modules (ES6+)' },
      ]
    },
    {
      link: '/vue/', text: 'Vue'
    },
    {
      link: '/css/', text: 'CSS', children: [
        { link: '/css/specificity/', text: 'CSS Specificity и каскад' },
        { link: '/css/performance/', text: 'CSS Performance' },
      ]
    },
    {
      link: '/practice/', text: 'Практика', children: [
        { link: '/practice/debounce/', text: 'Кастомный debounce (с опциями leading/trailing)' },
        { link: '/practice/throttle/', text: 'Кастомный throttle (с опциями leading/trailing)' },
        { link: '/practice/todo/', text: 'ToDo-лист на чистом JS (CRUD, localStorage, поиск с debounce, a11y)' },
        { link: '/practice/validation-form/', text: 'Кастомный form validator с a11y' },
      ]
    },
    {
      link: '/common/', text: 'Общие темы', children: [
        { link: '/common/WCAG/', text: 'Accessibility (a11y) WCAG 2.1/2.2' },
        { link: '/common/html5/', text: 'HTML5 Forms и валидация/2.2' },
      ]
    }
  ]
}
