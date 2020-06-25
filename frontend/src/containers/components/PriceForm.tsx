import React, { FC, useContext, useEffect } from 'react';
import moment from 'moment';
import Web3 from 'web3';
import {
  Alert, Button, Form, Input, Select, DatePicker, Row, Col,
} from 'antd';
import { Store } from 'antd/lib/form/interface';
import { useMutation } from '@apollo/react-hooks';
import { GET_MOVIE } from '../../apollo/queries';
import { ADD_PRICE, UPDATE_PRICE, DELETE_PRICE } from '../../apollo/mutations';
import { DashboardContext } from '../../components/DashboardContextProvider';
import Regions from '../../stores/humanizeM49';
import { PriceInterface } from './PriceType';
import humanizeError from '../../stores/utils/humanizeError';
import removeNullAttributes from '../../stores/utils/removeNullAttributes';


const { RangePicker } = DatePicker;

interface ComponentProps {
  price: PriceInterface,
  onClear: Function
}

const regionOptions = [<Select.Option value="001" key="001">DEFAULT</Select.Option>];
const countries = Object.keys(Regions);
countries.forEach((m49) => {
  if (Regions[m49]) {
    regionOptions.push(
      <Select.Option value={m49} key={m49}>{Regions[m49]}</Select.Option>,
    );
  }
});

const PriceForm: FC<ComponentProps> = ({ price, onClear }) => {
  const { user, config, applyFactor } = useContext(DashboardContext);
  const [form] = Form.useForm();
  const [addPrice, { error }] = useMutation(ADD_PRICE);
  const [putPrice, { error: putError }] = useMutation(UPDATE_PRICE);
  const [deletePrice, { error: deleteError }] = useMutation(DELETE_PRICE);
  const priceType = user && user.isAdmin() ? 'WHITERABBIT' : 'RIGHTSHOLDER';

  useEffect(() => {
    form.setFieldsValue(price);

    if (price.fromWindow) {
      form.setFieldsValue({
        window: [moment(price.fromWindow, 'YYYY-MM-DD'), moment(price.toWindow, 'YYYY-MM-DD')],
      });
    }

    if (price.amount) {
      form.setFieldsValue({
        amount: Web3.utils.fromWei(applyFactor(price.amount).toString()),
      });
    }
  }, [price, form, applyFactor]);


  const createPrice = (pricing: PriceInterface) => {
    addPrice({
      variables: {
        pricing: removeNullAttributes(pricing),
      },
      refetchQueries: [
        {
          query: GET_MOVIE,
          variables: { IMDB: price.IMDB },
        },
      ],
    })
      .then(() => onClear())
      .catch(() => {});
  };

  const updatePrice = (pricing: PriceInterface) => {
    putPrice({
      variables: {
        pricing: { ...removeNullAttributes(pricing), priceId: price.priceId },
      },
      refetchQueries: [
        {
          query: GET_MOVIE,
          variables: { IMDB: price.IMDB },
        },
      ],
    })
      .then(() => onClear())
      .catch(() => {});
  };

  const deletePriceAction = () => {
    deletePrice({
      variables: {
        pricing: { IMDB: price.IMDB, priceId: price.priceId },
      },
      refetchQueries: [
        {
          query: GET_MOVIE,
          variables: { IMDB: price.IMDB },
        },
      ],
    })
      .then(() => onClear())
      .catch(() => {});
  };

  const onFinish = async (values: Store) => {
    const factorAdjustedPrice = BigInt(Web3.utils.toWei(values.amount)) / BigInt(config?.factor);
    const pricing = {
      IMDB: price.IMDB,
      type: priceType,
      region: values.region,
      amount: factorAdjustedPrice.toString(),
      medium: values.medium,
      fromWindow: values.window && values.window[0].format('YYYY-MM-DD'),
      toWindow: values.window && values.window[1].format('YYYY-MM-DD'),
    };

    if (price.priceId) {
      updatePrice(pricing);
    } else {
      createPrice(pricing);
    }
  };

  return (
    <div>
      {price.priceId && <h1>Update price</h1>}
      {!price.priceId && <h1>New price</h1>}
      { error && <Alert type="error" message={humanizeError(error)} />}
      { putError && <Alert type="error" message={humanizeError(putError)} />}
      { deleteError && <Alert type="error" message={humanizeError(deleteError)} />}
      <Form
        name="add"
        form={form}
        layout="vertical"
        onFinish={onFinish}
      >

        <Form.Item
          label="IMDB ID"
          name="IMDB"
        >
          <Input placeholder="IMDB ID" disabled />
        </Form.Item>
        <Row gutter={16}>
          <Col className="gutter-row" xs={{ span: 24 }} lg={{ span: 12 }}>
            <Form.Item
              label="Region"
              name="region"
            >
              <Select
                showSearch
                placeholder="Select a region"
                optionFilterProp="children"
              >
                { regionOptions }
              </Select>
            </Form.Item>
            <Form.Item
              label="Price"
              name="amount"
              rules={[
                () => ({
                  validator(rule, value) {
                    const numValue = parseFloat(value);
                    if (!value || Object.is(numValue, NaN) || numValue <= 0) {
                      return Promise.reject(new Error('Price should be a positive number'));
                    }
                    return Promise.resolve();
                  },
                }),
              ]}
            >
              <Input type="number" suffix="XDAI" />
            </Form.Item>

          </Col>
          <Col className="gutter-row" xs={{ span: 24 }} lg={{ span: 12 }}>
            <Form.Item
              label="Movie Medium"
              name="medium"
            >
              <Select>
                <Select.Option value="THEATRE" key="THEATRE">Theatre</Select.Option>
                <Select.Option value="EST" key="EST">EST</Select.Option>
                <Select.Option value="DTR" key="DTR">DTR</Select.Option>
                <Select.Option value="PAYTV" key="PAYTV">Pay Tv</Select.Option>
                <Select.Option value="SVOD" key="SVOD">SVOD</Select.Option>
                <Select.Option value="FREETV" key="FREETV">Free Tv</Select.Option>
              </Select>
            </Form.Item>
            <Form.Item
              label="Price Window"
              name="window"
            >
              <RangePicker format="YYYY-MM-DD" />
            </Form.Item>

          </Col>
        </Row>
        <Form.Item>
          <div style={{ display: 'flex' }}>
            <Button type="primary" htmlType="submit" style={{ marginLeft: 'auto' }}>Save Price</Button>
            <Button type="ghost" htmlType="button" style={{ marginLeft: '20px' }} onClick={() => onClear()}>Cancel</Button>
            {price.priceId && <Button htmlType="button" style={{ marginLeft: 'auto' }} danger onClick={deletePriceAction}>Delete</Button>}
          </div>
        </Form.Item>
      </Form>
    </div>
  );
};

export default PriceForm;
