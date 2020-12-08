import React from 'react';
import { License } from '../../apollo/models';
import RegionTags from './RegionTags';
import Timeframe from './Timeframe';

type LicenseRestrictionsProps = {
  license: License;
};

export default ({ license }: LicenseRestrictionsProps) => (
  <div>
    <RegionTags regions={license.regions} />
    {license.fromDate && (
    <div>
      <Timeframe from={license.fromDate} to={license.toDate} />
    </div>
    )}
    {license.medium && (
    <div>
      {license.medium}
    </div>
    )}
  </div>
);
