// eslint-disable-next-line no-undef
module.exports = {
  extends: ['airbnb-typescript'],
  parserOptions: {
    project: './tsconfig.json'
  },
  rules: {
    'react/jsx-fragments': [0],
    'react/jsx-props-no-spreading': 'off',
    'react/prop-types': 'off',
    'no-else-return': 'off',
  }
};