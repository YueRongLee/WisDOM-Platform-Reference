/* eslint-disable no-restricted-imports */
import React from 'react';
import { Menu } from 'antd';

const TargetNodeMenu = ({
  publish,
  setRecordHeader,
  selectItem,
  setSelectItem,
}) => {
  const handleClick = type => {
    setSelectItem(type);
    setRecordHeader(type);
  };

  return (
    <Menu id="TargetNodeMenu" mode="horizontal" selectedKeys={[selectItem]}>
      <Menu.Item key="node" onClick={() => handleClick('node')}>
        Node Properties
      </Menu.Item>
      <Menu.Item
        disabled={!publish}
        key="properties"
        onClick={() => handleClick('properties')}
      >
        Data Target Properties
      </Menu.Item>
      <Menu.Item
        key="outputTransform"
        onClick={() => handleClick('outputTransform')}
      >
        Output Schema
      </Menu.Item>
      <Menu.Item key="output-data" onClick={() => handleClick('output-data')}>
        Preview
      </Menu.Item>
    </Menu>
  );
};

export default TargetNodeMenu;
