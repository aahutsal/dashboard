/* eslint-disable max-len */
// TODO: make sure npm run lint:fix doesn't introduce fixes which
// break lint check later (e.g. max-len)
import {
  Alert,
  Button, Card, DatePicker, Form, Select,
} from 'antd';
import { Store } from 'antd/lib/form/interface';
import React, { useContext, useEffect, useMemo } from 'react';
import { License, Medium, Company } from '@whiterabbitjs/dashboard-common';
import { useMutation, useQuery } from '@apollo/react-hooks';
import moment from 'moment';
import { COMPANY_SUBLICENSEES, DISTRIBUTORS, GET_MOVIE } from '../../../apollo/queries';
import RegionPicker from '../RegionPicker';
import { ADD_LICENSE, UPDATE_LICENSE, DELETE_LICENSE } from '../../../apollo/mutations';
import { DashboardContext } from '../../../components/DashboardContextProvider';
import humanizeError from '../../../stores/utils/humanizeError';

type MovieSublicenseFormProps = {
  movieId: string;
  license?: License;
  onCancel?: () => void,
  onSave?: (newLicense: License) => void,
};

const maybeDate = (dateStr?: Date) => (dateStr ? moment(dateStr) : undefined);

const SublicenseForm: React.FC<MovieSublicenseFormProps> = ({
  movieId, license, onCancel, onSave,
}) => {
  const { user } = useContext(DashboardContext);
  const [form] = Form.useForm();
  const [addLicense, { error: addError }] = useMutation(ADD_LICENSE);
  const [updateLicense, { error: updateError }] = useMutation(UPDATE_LICENSE);
  const [deleteLicense, { error: deleteError }] = useMutation(DELETE_LICENSE);
  const distributorsQuery = useQuery(DISTRIBUTORS);

  const licensedRegions = useMemo(() => user?.licensedRegions(movieId),
    [user, movieId]);

  const refetchQueries = [
    {
      query: GET_MOVIE,
      variables: {
        IMDB: movieId,
      },
    },
    {
      query: COMPANY_SUBLICENSEES,
    },
  ];

  const error = addError || updateError || deleteError;

  useEffect(() => {
    if (!license) {
      form.setFieldsValue({});
      return;
    }

    form.setFieldsValue({
      ...license,
      window: [maybeDate(license.fromDate), maybeDate(license.toDate)],
    });
  }, [license, form]);

  const onRegionChanged = (regionCodes: string[]) => {
    form.setFieldsValue({
      regions: regionCodes,
    });
  };

  const add = (newLicense: License) => addLicense({
    variables: { license: newLicense },
    refetchQueries,
  }).catch(() => { });

  const update = (newLicense: License) => updateLicense({
    variables: { license: newLicense },
    refetchQueries,
  }).catch(() => { });

  const remove = () => deleteLicense({
    variables: {
      license: { movieId, licenseId: license?.licenseId },
    },
    refetchQueries,
  }).then(onCancel).catch(() => { });

  const distributorsMap = useMemo(() => {
    const toValueLabel = ({ id, name }: Company) => ({ label: name, value: id });
    return distributorsQuery.data?.distributors.map(toValueLabel);
  }, [distributorsQuery.data]);

  const labelContainsInput = (input: string, { label }: any) => label.toLowerCase().indexOf(input.toLowerCase()) >= 0;

  const onFinish = async (values: Store) => {
    const newLicense = {
      licenseId: license?.licenseId,
      movieId,
      companyId: values.companyId,
      medium: values.medium,
      regions: values.regions,
      fromDate: values.window && values.window[0],
      toDate: values.window && values.window[1],
    };

    let result;
    if (license) {
      result = await update(newLicense);
    } else {
      result = await add(newLicense);
    }
    if (result && onSave) onSave(newLicense);
  };

  return (
    <Card style={{ marginBottom: '42px' }}>
      <h3>{license ? 'Update license' : 'New license'}</h3>
      {error && <Alert type="error" message={humanizeError(error)} />}
      <Form
        name="add"
        form={form}
        layout="vertical"
        onFinish={onFinish}
      >
        <Form.Item
          label="Company"
          name="companyId"
        >
          <Select
            loading={distributorsQuery.loading}
            showSearch
            filterOption={labelContainsInput}
            options={distributorsMap}
          />
        </Form.Item>
        <Form.Item
          label="Regions/Territory"
          name="regions"
        >
          <RegionPicker
            regionCodes={license?.regions || []}
            onChange={onRegionChanged}
            availableRegions={licensedRegions}
          />
        </Form.Item>
        <Form.Item
          label="Medium"
          name="medium"
          style={{ maxWidth: '130px' }}
        >
          <Select>
            {Object.keys(Medium).map((medium: string) => <Select.Option value={medium}>{medium}</Select.Option>)}
          </Select>
        </Form.Item>
        <Form.Item
          label="License Window"
          name="window"
        >
          <DatePicker.RangePicker />
        </Form.Item>

        <Form.Item>
          <div style={{ display: 'flex' }}>
            <Button type="primary" htmlType="submit" style={{ marginLeft: 'auto' }}>
              {license ? 'Update' : 'Add'}
              {' '}
              license
            </Button>
            <Button type="ghost" htmlType="button" style={{ marginLeft: '20px' }} onClick={onCancel}>Cancel</Button>
            {license?.licenseId && <Button style={{ marginLeft: 'auto' }} danger onClick={remove}>Delete</Button>}
          </div>
        </Form.Item>
      </Form>
    </Card>
  );
};

export default SublicenseForm;
