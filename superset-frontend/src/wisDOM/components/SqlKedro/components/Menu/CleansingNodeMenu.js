/* eslint-disable no-restricted-imports */
import React from 'react';
import { Menu } from 'antd';
// import { DATAFLOW_TYPE } from '~~constants/index';

const CleansingNodeMenu = ({
  setRecordHeader,
  optionPage,
  selectItem,
  setSelectItem,
  schemaLoading,
  // nodeData,
  // data,
}) => {
  const handleClick = type => {
    setSelectItem(type);
    setRecordHeader(type);
  };

  return (
    <Menu id="CleansingNodeMenu" mode="horizontal" selectedKeys={[selectItem]}>
      <Menu.Item key="node" onClick={() => handleClick('node')}>
        Node Properties
      </Menu.Item>
      <Menu.Item
        key="cleansing"
        disabled={!optionPage}
        onClick={() => handleClick('cleansing')}
      >
        Cleansing
      </Menu.Item>
      <Menu.Item
        key="outputTransform"
        onClick={() => handleClick('outputTransform')}
        disabled={schemaLoading}
      >
        Output Schema
      </Menu.Item>
    </Menu>
  );
};

export default CleansingNodeMenu;
