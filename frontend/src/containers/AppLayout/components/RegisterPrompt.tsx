import React from 'react';
import { Button, Result } from 'antd';

import { Link } from 'react-router-dom';
import logo from '../logo.png';
import { connect } from '../../../stores/Web3';

export default () => (
  <Result
    icon={<img src={logo} alt="logo" height="200" />}
    title="You need an account to use the app"
    extra={(
      <>
        New to WhiteRabbit?
        <div style={{ marginTop: '9px' }}>
          <Button type="primary">
            <Link to="/register">
              Create a new account
            </Link>
          </Button>
        </div>

        <div style={{ marginTop: '36px' }}>
          Already registered? Sign-in using your MetaMask wallet
          <div style={{ marginTop: '9px' }}>
            <Button type="primary" onClick={() => connect()}>
              Sign in
            </Button>
          </div>
        </div>
      </>
    )}
  />
);
