/* eslint-disable max-len */
// TODO: make sure npm run lint:fix doesn't introduce fixes which
// break lint check later (e.g. max-len)
import React, {
  useState, ChangeEvent, useCallback, useMemo,
} from 'react';
import {
  Tag,
  Tree,
} from 'antd';
import { Key } from 'antd/lib/table/interface';

import Search from 'antd/lib/input/Search';
import debounce from '../../../utils/debounce';
import Highlight from './highlight';
import { RegionRecord, RegionTreeElement } from './types';
import flattenRegionTree from './flattenRegionTree';

import m49tree from './m49-tree.json';
import groupRegions from './groupRegions';
import getMatchingAncestry from './getMatchingAncestry';

const flatFullRegionTree = flattenRegionTree(m49tree);

export type RegionSelectTreeResult = {
  regions: string[];
  regionGroups: RegionRecord[];
};

type RegionSelectTreeProps = {
  regionCodes: string[];
  availableRegions?: string[] | null;
  onChange?: (selection: RegionSelectTreeResult) => void
};

export default ({ regionCodes, availableRegions, onChange }: RegionSelectTreeProps) => {
  const [searchValue, setSearchValue] = useState<string>('');
  const [expandedKeys, setExpandedKeys] = useState<Key[]>([]);
  const [checkedKeys, setCheckedKeys] = useState<any>(regionCodes);

  const regionTree = useMemo(() => {
    if (availableRegions && availableRegions.length === 0) return m49tree;
    m49tree[0].title = 'All licensed regions';
    const visibleNodes = [
      ...(availableRegions || []),
      ...Array.from(new Set(availableRegions?.map((r) => flatFullRegionTree[r].parents).flat())),
    ];

    const loop = (data: RegionRecord[]): RegionRecord[] => data.filter((r) => visibleNodes.includes(r.key)).map((r) => ({
      key: r.key,
      title: r.title,
      children: r.children ? loop(r.children) : undefined,
    }));

    return loop(m49tree);
  }, [availableRegions]);

  const flatRegionTree = useMemo(() => flattenRegionTree(regionTree), [regionTree]);

  const [checkedRegionGroups, setCheckedRegionGroups] = useState<any>(groupRegions(regionCodes, flatFullRegionTree));

  const filterTreeNode = (node: any) => node.title.props.text.indexOf(searchValue) !== -1;

  const onSearch = (e: ChangeEvent<HTMLInputElement>) => {
    e.persist();
    debounce(() => {
      const { value } = e.target;
      const normalizedValue = value.toLowerCase();
      if (normalizedValue !== '') {
        setExpandedKeys(getMatchingAncestry(flatRegionTree, normalizedValue));
        setSearchValue(value);
      } else {
        setExpandedKeys([]);
        setSearchValue('');
      }
    }, 500)(e);
  };

  const loop = (data: RegionRecord[]): RegionTreeElement[] => data.map(({ key, title, children }: RegionRecord) => ({
    key,
    title: <Highlight text={title} needle={searchValue} />,
    children: children ? loop(children) : undefined,
  }));

  const isKeyOrSubKey = useCallback(
    (key1: string, key2: string) => key1 === key2 || flatRegionTree[key1].parents?.includes(key2),
    [flatRegionTree],
  );

  const removeRegion = (key: string) => {
    setCheckedKeys(checkedKeys.filter((k: string) => !isKeyOrSubKey(k, key)));
    setCheckedRegionGroups(checkedRegionGroups.filter((group: RegionRecord) => !isKeyOrSubKey(group.key, key)));
  };

  const onCheck = (fullyCheckedKeys: any) => {
    const checkedRegionCodes = (fullyCheckedKeys as string[]).filter((k) => !flatRegionTree[k].descendents.length);
    setCheckedKeys(checkedRegionCodes);
    setCheckedRegionGroups(groupRegions(checkedRegionCodes, flatFullRegionTree));

    if (onChange) {
      onChange({
        regions: checkedRegionCodes,
        regionGroups: checkedRegionGroups,
      });
    }
  };

  return (
    <div>
      Selected regions:
      <div style={{ marginBottom: '12px' }}>
        {checkedRegionGroups.map(({ key, title }: RegionRecord) => <Tag key={key} closable onClose={() => removeRegion(key)}>{title}</Tag>)}
      </div>
      <Search style={{ marginBottom: 8 }} placeholder="Search" onChange={onSearch} />
      <Tree
        checkable
        onExpand={setExpandedKeys}
        expandedKeys={expandedKeys}
        autoExpandParent={false}
        onCheck={onCheck}
        checkedKeys={checkedKeys}
        filterTreeNode={filterTreeNode}
        treeData={loop(regionTree)}
      />
    </div>
  );
};
