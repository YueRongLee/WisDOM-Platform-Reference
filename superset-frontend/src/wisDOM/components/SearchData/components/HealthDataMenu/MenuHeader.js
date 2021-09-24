/* eslint-disable no-restricted-imports */
import React from 'react';
import { Menu } from 'antd';

// const NewNodeMenu = ({ selectItem, setSelectItem, setRecordHeader }) => {
const healthDataMenu = ({ selectItem, setSelectItem }) => {
  const handleClick = e => {
    setSelectItem(e && e.key);
  };

  return (
    <Menu mode="horizontal" selectedKeys={[selectItem]}>
      <Menu.Item data-test="healthData" key="healthData" onClick={handleClick}>
        Metadata
      </Menu.Item>
      <Menu.Item key="WKC" onClick={handleClick}>
        Metadata(wkc)
      </Menu.Item>
    </Menu>
  );
};

export default healthDataMenu;
