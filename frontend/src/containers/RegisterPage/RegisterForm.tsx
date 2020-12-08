/* eslint-disable max-len */
// TODO: make sure npm run lint:fix doesn't introduce fixes which
// break lint check later (e.g. max-len)
import React, { useContext, useState, useEffect } from 'react';
import {
  Form, Input, Button, Alert, Spin, Select,
} from 'antd';
import { Store } from 'antd/lib/form/interface';
import { useMutation } from '@apollo/react-hooks';
import { CompanyType, MovieBase, movieFromTMDB } from '@whiterabbitjs/dashboard-common';
import { GET_USER } from '../../apollo/queries';
import { ADD_USER } from '../../apollo/mutations';
import { DashboardContext } from '../../components/DashboardContextProvider';
import PersonSearch, { PersonSearchValue } from '../components/PersonSearch';
import PendingUserScreen from '../components/PendingUserScreen';
import humanizeError from '../../stores/utils/humanizeError';
import MovieListWithRevenue from '../components/MovieListWithRevenue';
import { getCompanyMovies } from '../../stores/API';
import { recheckWallet } from '../../stores/Web3';
import CompanySearch, { CompanySearchValue } from '../components/CompanySearch';

const { Option } = Select;


export default () => {
  const { user } = useContext(DashboardContext);
  const [addUser, { loading, error }] = useMutation(ADD_USER);
  const [selectedPerson, setSelectedPerson] = useState<PersonSearchValue>();
  const [company, setCompany] = useState<CompanySearchValue>();
  const [formValues, setFormValues] = useState<Store>();

  const [selectedCompanyMovies, setSelectedCompanyMovies] = useState<MovieBase[]>();

  useEffect(() => {
    if (!company || !company.id) {
      setSelectedCompanyMovies([]);
      return;
    }
    getCompanyMovies(company.id)
      .then((tmdbMovies) => setSelectedCompanyMovies(tmdbMovies.map(movieFromTMDB)));
  }, [company]);

  const onFinish = (values: Store) => {
    setFormValues(values);
    recheckWallet(null).then((account: string | undefined) => {
      if (!account || user) return;
      addUser({
        variables: {
          user: {
            accountAddress: account,
            name: values.person.name,
            id: values.person.id,
            imdbId: values.person.imdbId,
            email: values.email,
            company: {
              id: values.company.id,
              name: values.company.name,
              kind: values.kind,
            },
            roles: ['RIGHTSHOLDER'],
          },
        },
        refetchQueries: [
          {
            query: GET_USER,
            variables: { accountAddress: account },
          },
        ],
      }).catch(() => { });
    });
  };

  if (user && user.status !== 'APPROVED') {
    return (
      <PendingUserScreen user={user} />
    );
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
    <div style={{ width: 400 }}>
      <h1>Welcome to White Rabbit!</h1>
      <p>
        We’d like to verify you as the owner of your film so you may immediately
        receive funds available to it. Verifying ownership helps us ensure rights
        holders receive revenue and allows your films to truly be accessible to a global
        audience. White Rabbit is a FilmTech company owned by film producers and financiers.
        We are proud to be creating a sustainable business model for our film industry.
      </p>
      { loading && 'Loading...' }
      { error && <Alert type="error" message={humanizeError(error)} />}
      <Spin spinning={loading}>
        <Form
          name="register"
          layout="vertical"
          onFinish={onFinish}
          onFieldsChange={onFieldsChange}
          initialValues={formValues}
        >
          <Form.Item
            label="Company Name"
            name="company"
          >
            <CompanySearch
              placeholder="Name of the Company as used on IMDB"
              onChange={setCompany}
            />
          </Form.Item>
          <Form.Item
            label="Your Name"
            name="person"
            rules={[{ validator: checkPerson }]}
          >
            <PersonSearch placeholder="Your name" />
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
              {Object.entries(CompanyType).map(([value, name]) => <Option key={value} value={value}>{name}</Option>)}
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
            <Button type="primary" htmlType="submit">Register</Button>
            <div>
              You will need
              {' '}
              <a href="https://metamask.io/">MetaMask wallet</a>
              {' '}
              for this.
            </div>
          </Form.Item>
        </Form>
      </Spin>

      {selectedCompanyMovies && selectedCompanyMovies.length > 0 && (
        <div style={{ marginTop: '2rem', maxWidth: '600px' }}>
          <h2>Pending revenue on WhiteRabbit</h2>
          <MovieListWithRevenue movies={selectedCompanyMovies} hideExactNumbers />
        </div>
      )}
    </div>
  );
};
