import { FlatRegionMap, RegionRecord } from './types';

const generateList = (
  parents: string[],
  m49flat: FlatRegionMap,
  data?: RegionRecord[],
) => {
  if (!data) return [];
  const allDescendents = [] as string[];
  for (let i = 0; i < data.length; i += 1) {
    const node = data[i];
    const { key, title } = node;
    const descendents: string[] = (node.children || [])
      .map((c) => c.key)
      .concat(generateList([...parents, key], m49flat, node.children));
    allDescendents.push(...descendents);
    // eslint-disable-next-line no-param-reassign
    m49flat[key] = {
      key, title, parents, descendents,
    };
  }
  return allDescendents;
};

export default (m49tree: RegionRecord[]) => {
  const m49flat = {} as FlatRegionMap;
  generateList([], m49flat, m49tree);
  return m49flat;
};
