import React, { useContext, useState, useEffect } from 'react';
import {
  Form, Input, Button, Alert, Spin,
} from 'antd';
import { Store } from 'antd/lib/form/interface';
import { useMutation } from '@apollo/react-hooks';
import { ApolloError } from 'apollo-boost';
import { useHistory } from 'react-router-dom';
import { GET_USER } from '../apollo/queries';
import { ADD_USER } from '../apollo/mutations';
import AppLayout from './AppLayout';
import { DashboardContext } from '../components/DashboardContextProvider';
import PersonSearch, { PersonSearchValue } from './components/PersonSearch';
import PendingUserScreen from './components/PendingUserScreen';
import MovieListWithRevenue from './components/MovieListWithRevenue';
import { TMDBMovie, getPersonCredits } from '../stores/API';

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
  const [selectedPerson, setSelectedPerson] = useState<PersonSearchValue>();

  const [selectedPersonMovies, setSelectedPersonMovies] = useState<TMDBMovie[]>();

  useEffect(() => {
    if (!selectedPerson || !selectedPerson.id) {
      setSelectedPersonMovies([]);
      return;
    }
    getPersonCredits(selectedPerson.id).then(setSelectedPersonMovies);
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
            onFieldsChange={onFieldsChange}
          >
            <Form.Item
              label="Your name"
              name="person"
              rules={[{ validator: checkPerson }]}
            >
              <PersonSearch placeholder="Your name as on IMDB" />
            </Form.Item>
            {selectedPerson && (
              <Form.Item label="IMDB id:">
                {selectedPerson.imdbId}
              </Form.Item>
            )}
            <Form.Item
              label="Email"
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
            <MovieListWithRevenue movies={selectedPersonMovies} />
          </div>
        )}
      </div>
    </AppLayout>
  );
};
