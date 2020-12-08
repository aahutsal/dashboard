import Modal from 'antd/lib/modal/Modal';
import React, { useState } from 'react';
import styled from 'styled-components';
import RegionSelectTree, { RegionSelectTreeResult } from '../RegionSelectTree';

import RegionTags from '../RegionTags';

type RegionPickerProps = {
  regionCodes: string[];
  availableRegions?: string[] | null;
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


export default ({
  regionCodes, availableRegions, placeholder, onChange,
}: RegionPickerProps) => {
  const [pickerVisible, setPickerVisible] = useState<boolean>(false);
  const [newResult, setNewResult] = useState<RegionSelectTreeResult>();
  const [checkedRegions, setCheckedRegions] = useState<string[]>(regionCodes);

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
        {checkedRegions.length > 0 && (
          <RegionTags regions={checkedRegions} />
        )}
        {checkedRegions.length === 0 && <>{placeholder || 'Select a region'}</>}
      </ClickablePanel>

      <Modal
        title="Regions"
        visible={pickerVisible}
        onOk={handleOk}
        onCancel={handleCancel}
      >
        <RegionSelectTree regionCodes={checkedRegions} onChange={setNewResult} availableRegions={availableRegions} />
      </Modal>
    </>
  );
};
