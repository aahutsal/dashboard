import React, { useState } from 'react';
import { Select, Avatar } from 'antd';
import { searchPersonInIMDB, IMDBSuggestion } from '../../stores/imdbAPI';

type PersonSearchProps = {
  value?: PersonSearchValue;
  onChange?: (value: PersonSearchValue) => void;
  placeholder?: string;
};

export interface PersonSearchValue {
  name?: string;
  imdbId?: string;
}

const MoviePerson: React.FC<{ person: IMDBSuggestion }> = ({ person }) => (
  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
    <div style={{ alignItems: 'center' }}>
      <Avatar src={person.i && person.i[0]} />
      {' '}
      {person.l}
    </div>
    <div style={{ fontSize: '0.8em', opacity: '0.8' }}>
      {person.s}
    </div>
  </div>
);

export default ({ value = {}, onChange, placeholder }: PersonSearchProps) => {
  const [suggestions, setSuggestions] = useState<IMDBSuggestion[]>([]);

  const onSearch = async (searchText: string) => {
    const result = await searchPersonInIMDB(searchText);
    setSuggestions(!searchText || !result ? [] : result.splice(0, 20));
  };

  const triggerChange = (label: string, option: any) => {
    if (!onChange) return;
    const changedValue = { imdbId: option.key, name: label };
    onChange({ ...value, ...changedValue });
  };

  return (
    <Select
      showSearch
      placeholder={placeholder}
      optionLabelProp="value"
      onSearch={onSearch}
      onChange={triggerChange}
    >
      {suggestions.map((s) => (
        <Select.Option key={s.id} value={s.l}>
          <MoviePerson person={s} />
        </Select.Option>
      ))}
    </Select>
  );
};
