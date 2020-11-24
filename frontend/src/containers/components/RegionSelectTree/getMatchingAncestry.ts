import { FlatRegionMap, RegionRecord } from './types';

/**
 * For a given list of regions, returns all the regions with title
 * matching given value and all of their parents up to the root.
 *
 * For instance, for a tree `
 *  World (001) -- Europe (010) → Western Europe (011) → Germany (246)
 *              \  \
 *               \  → Easter Europe (022)
 *                \
 * `               → Africa (020) ——→ Kenya (310)
 *                                \
 *                                 → Niger (210)
 *
 * and `Ger` as valueToMatch, it will return [001, 010, 011, 246, 020, 210]
 */
export default (m49flat: FlatRegionMap, valueToMatch: string) => Array.from(
  new Set(
    Object.values(m49flat)
      .reduce((result: string[], item: RegionRecord) => {
        if (item.title.toLowerCase().indexOf(valueToMatch) > -1) {
          return [...result, item.key, ...item.parents || []];
        }
        return result;
      }, []),
  ),
);
