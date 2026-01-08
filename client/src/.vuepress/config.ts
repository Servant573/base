import { defineUserConfig } from '@vuepress/cli'
import { defaultTheme } from '@vuepress/theme-default'
import { searchPlugin } from '@vuepress/plugin-search'
import { mediumZoomPlugin } from '@vuepress/plugin-medium-zoom'
import { head, navbarRu, sidebarRu } from './configs'
import viteBundler from '@vuepress/bundler-vite';

export default defineUserConfig({
  base: '/',
  dest: './dist/',
  markdown: {
    headers: {
      level: [2, 3, 4]
    }
  },
  head,
  locales: {
    '/': {
      lang: 'ru-RU',
      title: 'База знаний по web',
    }
  },
  bundler: viteBundler({
    viteOptions: {
      css: {
        preprocessorOptions: {
          scss: {},
        },
      },
    },
  }),
  theme: defaultTheme({
    logo: '/assets/images/logo.jpg',
    themePlugins: {
      mediumZoom: false
    },
    sidebar: sidebarRu,
    navbar: navbarRu,
  }),
  plugins: [
    mediumZoomPlugin({
      selector: '.theme-default-content > img:not(.not-zoom), .theme-default-content :not(a) > img:not(.not-zoom)',
      zoomOptions: {},
    }),
    searchPlugin({
      maxSuggestions: 10,
      locales: {
        '/': {
          placeholder: 'Поиск'
        }
      }
    }),
  ]
})

