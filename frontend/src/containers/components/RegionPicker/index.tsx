import Modal from 'antd/lib/modal/Modal';
import React, { useEffect, useState } from 'react';
import { Tag } from 'antd';
import styled from 'styled-components';
import RegionSelectTree, { RegionSelectTreeResult } from '../RegionSelectTree';
import { RegionRecord } from '../RegionSelectTree/types';

import m49tree from '../RegionSelectTree/m49-tree.json';
import flattenRegionTree from '../RegionSelectTree/flattenRegionTree';
import groupRegions from '../RegionSelectTree/groupRegions';

type RegionPickerProps = {
  regionCodes: string[];
  placeholder?: string;
  onChange?: (regionCodes: string[]) => void;
};

const ClickablePanel = styled.div`
  border: 1px solid transparent;
  padding: 4px 11px;
  cursor: pointer;

  &:hover {
    border-color: #40a9ff;
  }
`;

const m49flat = flattenRegionTree(m49tree);

export default ({ regionCodes, placeholder, onChange }: RegionPickerProps) => {
  const [pickerVisible, setPickerVisible] = useState<boolean>(false);
  const [newResult, setNewResult] = useState<RegionSelectTreeResult>();
  const [checkedRegionGroups, setCheckedRegionGroups] = useState<RegionRecord[]>([]);
  const [checkedRegions, setCheckedRegions] = useState<string[]>(regionCodes);

  useEffect(() => {
    setCheckedRegionGroups(groupRegions(checkedRegions, m49flat));
  }, [checkedRegions]);


  const handleOk = () => {
    const newRegionCodes = newResult ? newResult.regions : [];
    setCheckedRegions(newRegionCodes);
    if (onChange) onChange(newRegionCodes);
    setPickerVisible(false);
  };

  const handleCancel = () => {
    setPickerVisible(false);
  };

  return (
    <>
      <ClickablePanel onClick={() => setPickerVisible(true)}>
        {checkedRegionGroups.length > 0 && (
        <>
          {checkedRegionGroups.map(({ key, title }: RegionRecord) => <Tag key={key}>{title}</Tag>)}
        </>
        )}
        {checkedRegionGroups.length === 0 && <>{placeholder || 'Select a region'}</>}
      </ClickablePanel>

      <Modal
        title="Regions"
        visible={pickerVisible}
        onOk={handleOk}
        onCancel={handleCancel}
      >
        <RegionSelectTree regionCodes={checkedRegions} onChange={setNewResult} />
      </Modal>
    </>
  );
};
