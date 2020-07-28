import React, { FC, useState } from 'react';
import {
  List, Avatar, Button, Skeleton,
} from 'antd';

interface ComponentProps {
  data?: Array<any>,
  header: string,
  avatar?: string,
  label?: string,
}

const CreditList: FC <ComponentProps > = ({
  avatar, data, header, label,
}) => {
  const [loading, setLoading] = useState(false);
  const [list, setList] = useState(data ? data.slice(0, 8) : []);

  const onChangeDisplay = () => {
    setLoading(true);
    setList(data || []);
    // Resetting window's offsetTop so as to display react-virtualized demo underfloor.
    // In real scene, you can using public method of react-virtualized:
    // https://stackoverflow.com/questions/46700726/how-to-use-public-method-updateposition-of-react-virtualized
    window.dispatchEvent(new Event('resize'));
    setLoading(false);
  };

  const loadMore = !loading && data && data.length !== list.length ? (
    <div
      style={{
        textAlign: 'center',
        marginTop: 12,
        height: 32,
        lineHeight: '32px',
      }}
    >
      <Button onClick={() => onChangeDisplay()}>Load more</Button>
    </div>
  ) : null;

  return (
    <List
      header={<h1>{header}</h1>}
      loadMore={loadMore}
      dataSource={list}
      renderItem={(item) => (
        <List.Item>
          <Skeleton avatar title={false} loading={item.loading} active>
            <List.Item.Meta
              avatar={
                avatar && item[avatar]
                  ? <Avatar src={`https://image.tmdb.org/t/p/w500${item[avatar]}`} />
                  : <Avatar src={`https://ui-avatars.com/api/?background=000&color=fff&name=${item.name}`} />
              }
              title={item.name}
              description={
                label && item[label]
                  ? `${label.toUpperCase()}:  ${item[label]}`
                  : ''
              }
            />
          </Skeleton>
        </List.Item>
      )}
    />
  );
};

export default CreditList;
