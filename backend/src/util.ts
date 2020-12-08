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

export const intersects = (arr1: string[], arr2: string[]): boolean =>
  !!arr1.find(region => arr2.includes(region));

export const difference = <T>(
    arr1: T[],
    arr2: T[],
  ): T[] => [arr1, arr2].reduce((a, b) => a.filter((c) => !b.includes(c) ));

export const isStrictSubset = <T>(set: T[], subset: T[]): boolean =>
  difference(subset, set).length === 0;

const resetTime = (date: Date): Date => {
  date.setHours(0);
  date.setMinutes(0);
  date.setSeconds(0);
  date.setMilliseconds(0);
  return date;
}

export const dateOrMin = (date?: Date | string): Date => resetTime(new Date(date || 0));
export const dateOrMax = (date?: Date | string): Date => resetTime(new Date(date || 1e13));

export type DateFrame = [Date | string | undefined, Date | string | undefined];

export const dateFramesOverlap = (date1: DateFrame, date2: DateFrame): boolean => {
  return (dateOrMin(date1[0]) <= dateOrMin(date2[0]) && dateOrMax(date1[1]) >= dateOrMax(date2[0]))
  || (dateOrMin(date1[0]) >= dateOrMin(date2[0]) && dateOrMax(date1[0]) <= dateOrMax(date2[1]));
};

export const dateFrameIncluded = (largerDate: DateFrame, smallerDate: DateFrame): boolean => {
  return (dateOrMin(smallerDate[0]) >= dateOrMin(largerDate[0]) && dateOrMax(smallerDate[1]) <= dateOrMax(largerDate[1]));
};
  