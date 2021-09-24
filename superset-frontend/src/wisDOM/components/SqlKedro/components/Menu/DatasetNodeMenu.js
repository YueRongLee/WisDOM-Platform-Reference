/* eslint-disable no-restricted-imports */
import React from 'react';
import { Menu } from 'antd';

const DatasetNodeMenu = ({
  setRecordHeader,
  schemaId,
  selectItem,
  setSelectItem,
}) => {
  const handleClick = e => {
    setSelectItem(e && e.key);
    setRecordHeader(e && e.key);
  };

  return (
    <Menu id="DatasetNodeMenu" mode="horizontal" selectedKeys={[selectItem]}>
      <Menu.Item key="node" onClick={handleClick}>
        Node Properties
      </Menu.Item>
      <Menu.Item
        key="schema"
        disabled={!schemaId || schemaId === 'new_Node'}
        onClick={handleClick}
      >
        Schema
      </Menu.Item>
      <Menu.Item key="sample" onClick={handleClick}>
        Dataset Samples
      </Menu.Item>
    </Menu>
  );
};

export default DatasetNodeMenu;
