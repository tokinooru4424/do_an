import React from 'react';
import _ from 'lodash';
import { TreeSelect } from "antd";

interface TreeSelectSearchProps {
  value?: number,
  onChange?: (value: number) => void;
  treeData?: any;
  dropdownRender?: any;
  [x: string]: any
}

const TreeSelectSearch: React.FC<TreeSelectSearchProps> = ({ value, onChange, treeData, dropdownRender, ...otherProps }) => {
  const onChangeSelect = (value: any) => {
    onChange?.(value)
  };

  return <TreeSelect
    showSearch
    style={{ width: '100%' }}
    value={value}
    dropdownStyle={{ maxHeight: 400, overflow: 'auto' }}
    allowClear
    treeData={treeData}
    filterTreeNode={false}
    treeDefaultExpandAll
    dropdownRender={dropdownRender}
    onChange={onChangeSelect}
    {...otherProps}
  />
}

export default TreeSelectSearch