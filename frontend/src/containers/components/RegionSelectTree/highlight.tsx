import React from 'react';

type HighlightProps = {
  text: string;
  needle: string;
};

const Highlight: React.FC<HighlightProps> = ({ needle, text }) => {
  const index = text.toLowerCase().indexOf(needle.toLowerCase());
  if (index < 0 || needle === '') {
    return <span>{text}</span>;
  }

  const beforeStr = text.substr(0, index);
  const matchStr = text.substr(index, needle.length);
  const afterStr = text.substr(index + needle.length);

  return (
    <span>
      {beforeStr}
      <span style={{ backgroundColor: 'orange' }}>{matchStr}</span>
      {afterStr}
    </span>
  );
};

export default Highlight;
