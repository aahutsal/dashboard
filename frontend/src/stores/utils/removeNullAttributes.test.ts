import removeNullAttributes from './removeNullAttributes';

test('#removeNullAttributes', () => {
  expect(removeNullAttributes({ b: '1', a: null, c: 2 })).toEqual({ b: '1', c: 2 });
});
