module.exports = {
  rules: {
    'comma-dangle': [`error`, `never`],
    'eol-last': [`error`, `always`],
    'max-len': [`error`, { code: 120 }],
    'no-throw-literal': `warn`,
    'quote-props': [`error`, `as-needed`],
    curly: [`error`, `multi-line`],
    eqeqeq: `error`,
    quotes: ['error', 'single', { allowTemplateLiterals: true }],
    semi: [`error`, `never`]
  }
}
