import * as React from 'react';
import {
  Form, Input, Button, Alert, Spin,
} from 'antd';
import { Store } from 'antd/lib/form/interface';
import { useMutation } from '@apollo/react-hooks';
import { ApolloError } from 'apollo-boost';
import { ClockCircleOutlined } from '@ant-design/icons';
import { useHistory } from 'react-router-dom';
import { useContext } from 'react';
import { GET_USER } from '../apollo/queries';
import { ADD_USER } from '../apollo/mutations';
import AppLayout from './AppLayout';
import { DashboardContext } from '../components/DashboardContextProvider';

// TODO: duplicates the same from /Register. Move to utils and reuse
const humanizeError = (error: ApolloError) => {
  if (error.graphQLErrors) {
    return error.graphQLErrors.map((e) => e.message);
  }
  return error.message;
};

export default () => {
  const { account, user } = useContext(DashboardContext);
  const history = useHistory();
  const [addUser, { loading, error }] = useMutation(ADD_USER);

  const onFinish = (values: Store) => {
    addUser({
      variables: {
        user: {
          accountAddress: account,
          name: values.name,
          contact: values.contact,
          roles: ['RIGHTSHOLDER'],
        },
      },
      refetchQueries: [
        {
          query: GET_USER,
          variables: { accountAddress: account },
        },
      ],
    })
      .catch(() => { });
  };

  if (user && user.status !== 'APPROVED') {
    return (
      <AppLayout>
        <Alert
          message="Pending identity verification"
          description="Sit tight, Alan will contact you soon to verify your identity."
          type="warning"
          showIcon
          icon={<ClockCircleOutlined />}
          style={{ width: 400 }}
        />
      </AppLayout>
    );
  }

  if (user && user.status === 'APPROVED') {
    history.push('/');
  }

  return (
    <AppLayout>
      <div style={{ width: 400 }}>
        <h1>Please introduce yourself</h1>
        <p>
          We want to verify your identity first. This way we ensure only
          the rights holders can enter information into the system
        </p>
        { loading && 'Loading...' }
        { error && <Alert type="error" message={humanizeError(error)} />}
        <Spin spinning={loading}>
          <Form
            name="register"
            layout="vertical"
            onFinish={onFinish}
          >
            <Form.Item
              label="Legal Name"
              name="name"
              rules={[{ required: true, message: 'Please enter your legal name' }]}
            >
              <Input placeholder="What's your legal name?" />
            </Form.Item>
            <Form.Item
              label="Contact"
              name="contact"
              rules={[{ required: true, message: 'Please enter your contact (email/phone/messanger)' }]}
            >
              <Input placeholder="How can we reach you out?" />
            </Form.Item>
            <Form.Item>
              <Button type="primary" htmlType="submit">Send for Approval</Button>
            </Form.Item>
          </Form>
        </Spin>
      </div>
    </AppLayout>
  );
};
