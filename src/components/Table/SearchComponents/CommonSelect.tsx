import React from 'react';
import useBaseHook from '@src/hooks/BaseHook';
import { Select } from 'antd';
import _ from 'lodash';

const { Option } = Select;

interface SelectProps {
  value?: number,
  options?: any[];
  minOptions?: number;
  [x: string]: any;
}

const CommonSelect: React.FC<SelectProps> = ({ value, options, ...otherProps }) => {
  const { t } = useBaseHook();

  const renderOptions = () => {
    return options.map(item => <Option value={item.id} key={item.id}>
      {item.name || item.content}
    </Option>)
  }

  return <Select
    showSearch
    allowClear
    filterOption={(input, option) => {
      return (option.props?.children?.dangerouslySetInnerHTML ? option.props?.children?.dangerouslySetInnerHTML : option.props?.children?.props?.children?.props?.children?.props?.text || '').toLowerCase().includes(input.toLowerCase())
    }}
    placeholder={t("common:select")}
    value={value}
    {...otherProps}
  >
    {renderOptions()}
  </Select>
}

export default CommonSelect
