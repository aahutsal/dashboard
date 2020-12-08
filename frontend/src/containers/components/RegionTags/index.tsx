import { Tag } from 'antd';
import React from 'react';
import groupRegions from '../RegionSelectTree/groupRegions';
import { RegionRecord } from '../RegionSelectTree/types';
import m49tree from '../RegionSelectTree/m49-tree.json';
import flattenRegionTree from '../RegionSelectTree/flattenRegionTree';

type RegionTagsProps = {
  regions?: string[];
};

const m49flat = flattenRegionTree(m49tree);

export default ({ regions }: RegionTagsProps) => {
  if (!regions?.length) return <Tag key="001">Global</Tag>;
  return (
    <>
      {groupRegions(regions, m49flat)
        .map(({ key, title }: RegionRecord) => <Tag key={key}>{title}</Tag>)}
    </>
  );
};
