import React from 'react';
import { Button, Result } from 'antd';

import logo from '../logo.png';
import { refreshAuthToken } from '../../../stores/Web3';

export default () => (
  <Result
    icon={<img src={logo} alt="logo" height="200" />}
    title="Please sign the message with your MetaMask"
    subTitle="This way you prove your identity to us as you are the only one with access to your MetaMask account."
    extra={(
      <Button type="primary" onClick={refreshAuthToken}>
        Sign in
      </Button>
    )}
  />
);
