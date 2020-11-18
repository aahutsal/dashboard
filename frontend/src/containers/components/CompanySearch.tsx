import React, { useState } from 'react';
import { Select } from 'antd';
import { TMDBCompany } from '@whiterabbitjs/dashboard-common';
import { searchCompanies } from '../../stores/API';

type CompanySearchProps = {
  value?: CompanySearchValue;
  onChange?: (value: CompanySearchValue) => void;
  placeholder?: string;
};

export interface CompanySearchValue {
  name?: string;
  id?: string;
}


export default ({ value, onChange, placeholder }: CompanySearchProps) => {
  const [suggestions, setSuggestions] = useState<TMDBCompany[]>([]);
  const [enteredName, setEnteredName] = useState<string>();

  const onSearch = async (searchText: string) => {
    setEnteredName(searchText);
    if (!searchText) {
      setSuggestions([]);
      return;
    }
    const result = await searchCompanies(searchText);
    setSuggestions(result.splice(0, 20));
  };

  const onSelect = async (label: string, option: any) => {
    if (!onChange) return;
    const changedValue = { id: option.key, name: option.value };
    onChange({ ...value, ...changedValue });
  };

  return (
    <Select
      showSearch
      placeholder={placeholder}
      optionLabelProp="value"
      onSearch={onSearch}
      onChange={onSelect}
    >
      {suggestions.map((s) => (
        <Select.Option key={s.id} value={s.name}>
          {s.name}
        </Select.Option>
      ))}
      {enteredName && (
      <Select.Option key={0} value={enteredName}>
        Other...
      </Select.Option>
      )}
    </Select>
  );
};
