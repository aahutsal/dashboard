import React from 'react';
import moment from 'moment';

const maybeDate = (dateStr?: Date) => (dateStr ? moment(dateStr).format('DD/MM/YYYY') : '');

type TimeframeProps = {
  from?: Date;
  to?: Date;
};

export default ({ from, to }: TimeframeProps) => (
  <>
    {maybeDate(from)}
    —
    {maybeDate(to)}
  </>
);
