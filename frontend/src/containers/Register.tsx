import React, { useContext, useState, useEffect } from 'react';
import {
  Form, Input, Button, Alert, Spin, Select,
} from 'antd';
import { Store } from 'antd/lib/form/interface';
import { useMutation } from '@apollo/react-hooks';
import { useHistory } from 'react-router-dom';
import { TMDBMovie } from '@whiterabbitjs/dashboard-common';
import { GET_USER } from '../apollo/queries';
import { ADD_USER } from '../apollo/mutations';
import AppLayout from './AppLayout';
import { DashboardContext } from '../components/DashboardContextProvider';
import PersonSearch, { PersonSearchValue } from './components/PersonSearch';
import PendingUserScreen from './components/PendingUserScreen';
import humanizeError from '../stores/utils/humanizeError';
import MovieListWithRevenue from './components/MovieListWithRevenue';
import { getPersonCredits } from '../stores/API';

const { Option } = Select;


export default () => {
  const { account, user } = useContext(DashboardContext);
  const history = useHistory();
  const [addUser, { loading, error }] = useMutation(ADD_USER);
  const [selectedPerson, setSelectedPerson] = useState<PersonSearchValue>();

  const [selectedPersonMovies, setSelectedPersonMovies] = useState<TMDBMovie[]>();

  useEffect(() => {
    if (!selectedPerson || !selectedPerson.id) {
      setSelectedPersonMovies([]);
      return;
    }
    getPersonCredits(selectedPerson.id)
      .then((movies) => movies.filter((m) => m.jobs.length > 1 || m.jobs[0].job !== 'Actor'))
      .then(setSelectedPersonMovies);
  }, [selectedPerson]);

  const onFinish = (values: Store) => {
    addUser({
      variables: {
        user: {
          accountAddress: account,
          name: values.person.name,
          id: values.person.id,
          imdbId: values.person.imdbId,
          email: values.email,
          kind: values.kind,
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
      <PendingUserScreen user={user} />
    );
  }

  if (user && user.status === 'APPROVED') {
    history.push('/');
  }

  const checkPerson = (rule: any, value: PersonSearchValue) => {
    if (value && value.id && value.name && value.imdbId) {
      return Promise.resolve();
    }
    return Promise.reject(new Error('Person with IMDB id is needed'));
  };

  const onFieldsChange = (changedFields: any) => {
    if (changedFields.length && changedFields[0].name[0] === 'person') {
      setSelectedPerson(changedFields[0].value);
    }
  };

  return (
    <AppLayout section="register">
      <div style={{ width: 400 }}>
        <h1>Please introduce yourself</h1>
        <p>
          Verifying you and your role in individual films is key.
          This registry helps the film industry ensure only the true rights holders
          make claims and make new films available for global distribution.
        </p>
        { loading && 'Loading...' }
        { error && <Alert type="error" message={humanizeError(error)} />}
        <Spin spinning={loading}>
          <Form
            name="register"
            layout="vertical"
            onFinish={onFinish}
            onFieldsChange={onFieldsChange}
          >
            <Form.Item
              label="Legal Name of Person"
              name="person"
              rules={[{ validator: checkPerson }]}
            >
              <PersonSearch placeholder="Legal Name of Person as on IMDB" />
            </Form.Item>
            {selectedPerson && (
              <Form.Item label="IMDB id:">
                {selectedPerson.imdbId}
              </Form.Item>
            )}
            <Form.Item
              label="Type of Role"
              name="kind"
              rules={[{ required: true, message: 'Please enter your email' }]}
            >
              <Select>
                <Option value="Production">Production</Option>
                <Option value="Sales">Sales</Option>
                <Option value="Distribution">Distribution</Option>
                <Option value="Financing">Financing</Option>
                <Option value="Public Institution">Public Institution</Option>
                <Option value="Other">Other</Option>
              </Select>
            </Form.Item>
            <Form.Item
              label="Contact email"
              name="email"
              rules={[{ required: true, message: 'Please enter your email' }]}
            >
              <Input placeholder="Email" />
            </Form.Item>
            <Form.Item>
              <Button type="primary" htmlType="submit">Send for Approval</Button>
            </Form.Item>
          </Form>
        </Spin>

        {selectedPersonMovies && selectedPersonMovies.length > 0 && (
          <div style={{ marginTop: '2rem', maxWidth: '600px' }}>
            <h2>Pending revenue on WhiteRabbit</h2>
            <MovieListWithRevenue movies={selectedPersonMovies} hideExactNumbers />
          </div>
        )}
      </div>
    </AppLayout>
  );
};
