module.exports = {
  plugins: [
    require('autoprefixer'),
    require('@fullhuman/postcss-purgecss')({
      content: [
        './layouts/**/*.html',
        './content/**/*.md',
        './static/**/*.js',
        './themes/ananke/layouts/**/*.html'
      ],
      defaultExtractor: content => content.match(/[\w-/:]+(?<!:)/g) || [],
      safelist: [
        // Hugo 类名
        'highlight',
        'chroma',
        // 响应式类名
        /^(sm|md|lg|xl):/,
        // 动态类名
        /^carousel-/,
        /^modal-/,
        /^dropdown-/,
        // 图片相关类名
        /^img-/,
        /^figure-/,
        // CMS 相关类名
        /^cms-/,
        /^admin-/
      ]
    })
  ]
}
