import React, { useState } from 'react';
import { Select, Avatar, Popconfirm } from 'antd';
import { QuestionCircleOutlined } from '@ant-design/icons';
import { TMDBPerson } from '@whiterabbitjs/dashboard-common';
import { searchPersonInIMDB, IMDBSuggestion } from '../../stores/imdbAPI';
import { searchPerson, getPersonByTMDB } from '../../stores/API';

type PersonSearchProps = {
  value?: PersonSearchValue;
  onChange?: (value: PersonSearchValue) => void;
  placeholder?: string;
};

export interface PersonSearchValue {
  name?: string;
  id?: number;
  imdbId?: string;
}

const FirstKnownFor = ({ person }: { person: TMDBPerson }) => {
  const firstRecord = person.known_for[0];
  if (!firstRecord) return (<div />);
  const year = (firstRecord.release_date || firstRecord.first_air_date || '').split('-')[0];
  const title = firstRecord.title || firstRecord.name;
  return (
    <div style={{ fontSize: '0.8em', opacity: '0.8' }}>
      {' '}
      {title && title.length > 18 ? `${title.substring(0, 18)}..` : title}
      {' '}
      {year ? `(${year})` : ''}
    </div>
  );
};

const MoviePerson = ({ person }: { person: TMDBPerson }) => (
  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
    <div style={{ alignItems: 'center' }}>
      <Avatar src={person.profile_path && `https://image.tmdb.org/t/p/w500${person.profile_path}`} />
      {' '}
      {person.name}
    </div>
    <FirstKnownFor person={person} />
  </div>
);


export default ({ value = {}, onChange, placeholder }: PersonSearchProps) => {
  const [suggestions, setSuggestions] = useState<TMDBPerson[]>([]);

  const [tmdbUser, setTMDBUser] = useState<TMDBPerson>();
  const [imdbSuggestions, setIMDBSuggestions] = useState<IMDBSuggestion[]>();
  const [imdbSuggestionIndex, setImdbSuggestionIndex] = useState<number>(-1);

  const onSearch = async (searchText: string) => {
    if (imdbSuggestions) setIMDBSuggestions(undefined);
    const result = await searchPerson(searchText);
    setSuggestions(!searchText || !result ? [] : result.splice(0, 20));
  };

  const triggerChange = (id: number, imdbId: string, name: string) => {
    if (!onChange) return;
    const changedValue = { id, imdbId, name };
    onChange({ ...value, ...changedValue });
  };

  const checkUser = async (label: string, option: any) => {
    if (!onChange) return;
    const person = await getPersonByTMDB(option.key);
    if (person.imdb_id) {
      triggerChange(person.id, person.imdb_id, person.name);
      return;
    }
    setTMDBUser(person);
    const personSuggestions = await searchPersonInIMDB(label);
    setIMDBSuggestions(personSuggestions);
    setImdbSuggestionIndex(0);
  };

  const currentSuggestion = imdbSuggestions ? imdbSuggestions[imdbSuggestionIndex] : null;
  return (
    <Popconfirm
      title={currentSuggestion && (
      <div>
        Are you?
        <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
          {currentSuggestion.i && <Avatar src={currentSuggestion.i[0]} style={{ marginRight: '6px' }} />}
          <div>
            <b>{currentSuggestion.l}</b>
            <br />
            {currentSuggestion.s}
          </div>
        </div>
      </div>
      )}
      onConfirm={() => {
        if (!tmdbUser || !currentSuggestion) return;
        triggerChange(tmdbUser.id, currentSuggestion.id, tmdbUser.name);
        setIMDBSuggestions(undefined);
      }}
      onCancel={() => {
        if (imdbSuggestions && imdbSuggestionIndex + 1 >= imdbSuggestions.length) {
          setIMDBSuggestions(undefined);
        } else {
          setImdbSuggestionIndex(imdbSuggestionIndex + 1);
        }
      }}
      visible={!!currentSuggestion}
      icon={<QuestionCircleOutlined />}
      okText="Yes"
      cancelText="No"
      placement="bottom"
    >
      <Select
        showSearch
        placeholder={placeholder}
        optionLabelProp="value"
        onSearch={onSearch}
        onChange={checkUser}
      >
        {suggestions.map((s) => (
          <Select.Option key={s.id} value={s.name}>
            <MoviePerson person={s} />
          </Select.Option>
        ))}
      </Select>
    </Popconfirm>
  );
};
