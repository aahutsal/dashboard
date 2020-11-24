export type RegionRecord = {
  key: string;
  title: string;
  parents?: string[];
  children?: RegionRecord[];
};

export type ExtendedRegionRecord = {
  key: string;
  title: string;
  parents: string[];
  descendents: string[];
};

export type RegionTreeElement = {
  title: JSX.Element;
  key: string;
  children?: RegionTreeElement[];
};

export type FlatRegionMap = {
  [key: string]: ExtendedRegionRecord;
};
