/* eslint-disable no-restricted-imports */
import React from 'react';
import { Menu } from 'antd';

const NewNodeMenu = ({ selectItem, setSelectItem, setRecordHeader }) => {
  const handleClick = e => {
    setSelectItem(e && e.key);
    setRecordHeader(e && e.key);
  };

  return (
    <Menu id="NewNodeMenu" mode="horizontal" selectedKeys={[selectItem]}>
      <Menu.Item key="node" onClick={handleClick}>
        Node Properties
      </Menu.Item>
    </Menu>
  );
};

export default NewNodeMenu;
