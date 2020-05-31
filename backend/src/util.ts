import { QueryIterator } from '@aws/dynamodb-data-mapper';

export const toArray = async <T>(iterable: QueryIterator<T> | Iterable<T>): Promise<T[]> => {
  const result = new Array<T>();
  for await (const item of iterable) {
      result.push(item);
  }
  return result;
}