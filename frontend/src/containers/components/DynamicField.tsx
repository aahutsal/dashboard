import React, { FC } from 'react';
import { Form, Input, Button } from 'antd';
import { MinusCircleOutlined, PlusOutlined } from '@ant-design/icons';

const formItemLayout = {
  labelCol: {
    xs: { span: 24 },
    sm: { span: 24 },
  },
  wrapperCol: {
    xs: { span: 24 },
    sm: { span: 24 },
  },
};

interface ComponentProps {
  name: string,
  label: string,
}

const DynamicFieldSet: FC<ComponentProps> = ({ name, label }) => (
  <Form.List name={name}>
    {(fields, { add, remove }) => (
      <div>
        {fields.map((field, index) => (
          <Form.Item
            {...formItemLayout}
            label={index === 0 ? label : ''}
            required={false}
            key={field.key}
          >
            <Form.Item
              {...field}
              validateTrigger={['onChange', 'onBlur']}
              rules={[
                {
                  required: true,
                  whitespace: true,
                  message: `Please input ${label} or delete this field.`,
                },
              ]}
              noStyle
            >
              <Input placeholder="new field" disabled style={{ width: '80%' }} />
            </Form.Item>
            {fields.length > 1 ? (
              <MinusCircleOutlined
                disabled
                className="dynamic-delete-button"
                style={{ margin: '0 8px' }}
                onClick={() => {
                  remove(field.name);
                }}
              />
            ) : null}
          </Form.Item>
        ))}
        <Form.Item>
          <Button
            disabled
            type="dashed"
            onClick={() => {
              add();
            }}
            style={{ width: '60%' }}
          >
            <PlusOutlined />
            {' '}
            Add field
          </Button>
        </Form.Item>
      </div>
    )}
  </Form.List>
);

export default DynamicFieldSet;
