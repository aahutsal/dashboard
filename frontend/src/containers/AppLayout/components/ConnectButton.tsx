import React from 'react';

import { Button } from 'antd';
import { connect } from '../../../stores/Web3';

const ConnectButton = () => (
  <Button type="primary" onClick={connect}>
    Connect
  </Button>
);

export default ConnectButton;
