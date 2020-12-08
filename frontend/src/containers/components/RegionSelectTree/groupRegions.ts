/* eslint-disable max-len */
// TODO: make sure npm run lint:fix doesn't introduce fixes which
// break lint check later (e.g. max-len)
import { ExtendedRegionRecord, FlatRegionMap, RegionRecord } from './types';

const difference = <T>(
  arr1: T[],
  arr2: T[],
  extraCondition?: (c: T) => boolean,
) => [arr1, arr2].reduce((a, b) => a.filter((c) => !b.includes(c) && extraCondition && extraCondition(c)));

export default (
  selectedRegionCodes: string[],
  m49flat: FlatRegionMap,
): RegionRecord[] => {
  const regionsToExclude = [] as string[];
  const groups = [] as ExtendedRegionRecord[];

  // if all the subregions are selected, collapse selection list into a single entry.
  // we do this by excluding all the descendants regions of the selected one
  // selectedRegionCodes.forEach((k: string) => regionsToExclude.push(...m49flat[k]?.descendents));

  Object.values(m49flat).forEach((region: ExtendedRegionRecord) => {
    // country, not region
    if (region.descendents.length === 0) return;

    const uncheckedDescendents = difference(
      region.descendents,
      selectedRegionCodes,
      (code: string) => !m49flat[code]?.descendents.length,
    );

    if (uncheckedDescendents.length === region.descendents.length) {
      return;
    }

    // if all the subregions are selected, mark the current region as selected
    if (uncheckedDescendents.length === 0) {
      selectedRegionCodes.push(region.key);
      regionsToExclude.push(...region.descendents);
      return;
    }

    // exclude the region itself, it will be replaced by a special group record below
    regionsToExclude.push(region.key);

    // if selected all but few descendents, collapse selection list into a single entry
    // like `Western Europe (except Germany, France)`
    if (uncheckedDescendents.length < 4) {
      // exclude individual countries to be listed as groups
      regionsToExclude.push(...region.descendents);

      // add a "group" selection entry with a specially formatted title
      const uncheckedNames = uncheckedDescendents.map(
        (code: string) => m49flat[code]?.title,
      );
      groups.push({
        ...region,
        title: `${region.title} (except ${uncheckedNames.join(', ')})`,
      });
    }
  });

  // create array of ExtendedRegionRecords to show as selected
  const regionGroups = Array.from(
    new Set<ExtendedRegionRecord>(
      selectedRegionCodes
        .filter((code: string) => !regionsToExclude.includes(code)) // exclude individual regions if needed
        .map((code: string) => m49flat[code]) // convert to RegionRecord
        .concat(groups),
    ),
  );

  // collapse chained groups leaving only the topmost group
  // E.g. `World (except Russia), Europe (except Russia),...` becomes `World (except Russia)`
  return regionGroups.filter(
    (g: ExtendedRegionRecord) => !regionGroups.find((g1: ExtendedRegionRecord) => g1.descendents.includes(g.key)),
  );
};
