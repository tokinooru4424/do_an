import React from 'react';
import arrayToTree from 'array-to-tree'
import TreeSelectSearch from './TreeSelectSearch';
import _ from 'lodash';

interface SelectProps {
  value?: number,
  onChange?: (value: number) => void;
  options?: any[];
  minOptions?: number;
  [x: string]: any;
}

const TreeSelect: React.FC<SelectProps> = ({ value, onChange, options, ...otherProps }) => {
  const onChangeSelect = (value: any) => {
    onChange?.(value)
  };

  const idDisdiable = (options) => {
    let results = [];
    let current = options.filter((item: any) => !item.parentId);

    if (!current.length) return results;

    let parentIds = current.map((item: any) => item.id)
    let isContinue = true;

    while (isContinue) {
      let children = options.filter((item: any) => parentIds.includes(item.parentId))
      let check = children.map((item: any) => item.parentId)
      parentIds.forEach((id: any) => {
        if (!check.includes(id)) {
          results.push(id)
        }
      })

      if (children.length) {
        parentIds = children.map(e => e.id);
        parentIds = parentIds.filter(e => e);
      } else {
        isContinue = false;
      }
    }

    let data = options.filter(item => results.includes(item.id)).map((item: any) => item.id)

    return data
  }

  //convert location  to tree
  const convertToTree = () => {
    options = options.map(item => {
      if (!idDisdiable(options).includes(item.id)) {
        return {
          ...item,
          disabled: true,
        }
      }
      return item;
    });

    options = options.map(item => ({
      ...item,
      title: item.name,
      value: item.id
    }))

    const treeData = arrayToTree(options, { parentProperty: "parentId" });

    return treeData || [];
  }

  return <TreeSelectSearch
    onChange={onChangeSelect}
    treeData={convertToTree()}
    value={value}
    {...otherProps}
  />
}

export default TreeSelect