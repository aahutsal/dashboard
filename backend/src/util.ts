import { QueryIterator } from '@aws/dynamodb-data-mapper';

export const toArray = async <T>(iterable: QueryIterator<T> | Iterable<T>): Promise<T[]> => {
  const result = new Array<T>();
  for await (const item of iterable) {
      result.push(item);
  }
  return result;
}

export const first = (list: string | string[]): string => {
  if (list.length === 0) return '';

  if (typeof list === 'string') {
      return list;
  }
  return list[0];
};